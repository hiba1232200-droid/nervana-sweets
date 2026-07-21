import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/security/password";
import { verifyTotp } from "@/lib/security/totp";
import { loginSchema } from "@/lib/validation/schemas";
import { getUserPermissions } from "@/lib/security/rbac";

// Verify Google reCAPTCHA v3 (skipped if not configured — dev friendly).
async function verifyCaptcha(token?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    return data.success && (data.score ?? 1) >= 0.5;
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h; auto-expires
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
        captchaToken: { label: "Captcha", type: "text" },
      },
      async authorize(raw, req) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, totp, captchaToken } = parsed.data;

        const ip = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0] || "unknown";
        const userAgent = (req?.headers?.["user-agent"] as string) || "";

        const ok = await verifyCaptcha(captchaToken);
        const fail = async () => {
          await prisma.loginHistory.create({ data: { email, success: false, ip, userAgent } }).catch(() => {});
          return null;
        };
        if (!ok) return fail();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.status === "BANNED") return fail();

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return fail();

        if (user.twoFactorEnabled) {
          if (!totp || !user.twoFactorSecret || !verifyTotp(totp, user.twoFactorSecret)) return fail();
        }

        await prisma.loginHistory.create({ data: { userId: user.id, email, success: true, ip, userAgent } }).catch(() => {});
        await prisma.auditLog.create({ data: { userId: user.id, action: "auth.login", ip, userAgent } }).catch(() => {});

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    // Phone-number login via OTP — verifies the code inside authorize.
    CredentialsProvider({
      id: "phone",
      name: "Phone",
      credentials: { phone: { label: "Phone", type: "text" }, code: { label: "Code", type: "text" } },
      async authorize(raw) {
        const phone = String(raw?.phone || "");
        const code = String(raw?.code || "");
        if (!/^[0-9+\-\s()]{6,30}$/.test(phone) || !/^\d{6}$/.test(code)) return null;

        const otp = await prisma.phoneOtp.findFirst({
          where: { phone, verified: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp || otp.attempts >= 5) return null;
        const valid = await verifyPassword(code, otp.codeHash);
        if (!valid) {
          await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } }).catch(() => {});
          return null;
        }
        await prisma.phoneOtp.update({ where: { id: otp.id }, data: { verified: true } });
        const customerRole = await prisma.role.findUnique({ where: { name: "customer" } });
        // Phone-only accounts still need a unique email (schema requires it).
        const placeholderEmail = `${phone.replace(/[^0-9]/g, "")}@phone.nervana.local`;
        const user = await prisma.user.upsert({
          where: { phone },
          update: { phoneVerified: new Date() },
          create: {
            phone,
            email: placeholderEmail,
            name: "NERVANA Customer",
            roleId: customerRole?.id,
            phoneVerified: new Date(),
            customer: { create: {} },
          },
        });
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id as string }, include: { role: true } });
        token.role = dbUser?.role?.name ?? "customer";
        token.permissions = Array.from(await getUserPermissions(user.id as string));
        token.ver = dbUser?.tokenVersion ?? 0;
      } else if (token.uid) {
        // Enforce "log out from all devices": reject tokens whose version is stale.
        const db = await prisma.user.findUnique({ where: { id: token.uid as string }, select: { tokenVersion: true } });
        if (!db || db.tokenVersion !== token.ver) return {};
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
};
