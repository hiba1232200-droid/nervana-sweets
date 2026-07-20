import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody } from "@/lib/api/respond";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/security/password";
import { generateToken, hashToken, minutesFromNow } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { notifyAdmin } from "@/lib/telegram/bot";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// POST /api/auth/register — email sign-up + verification email.
export const POST = route(async (req) => {
  const { name, email, password } = await parseBody(req, registerSchema);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return err("An account with this email already exists", 409);

  const customerRole = await prisma.role.findUnique({ where: { name: "customer" } });
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      roleId: customerRole?.id,
      customer: { create: {} },
    },
  });

  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: { email, token: hashToken(token), expiresAt: minutesFromNow(60 * 24) },
  });
  await sendVerificationEmail(email, token);
  await prisma.notification.create({ data: { type: "USER", title: "New Customer", body: `${name} (${email})` } }).catch(() => {});
  await notifyAdmin(`🙋 <b>New customer registered</b>\n${name} · ${email}`);
  await audit({ userId: user.id, action: "auth.register", req });

  return ok({ id: user.id, email: user.email, needsVerification: true }, 201);
});
