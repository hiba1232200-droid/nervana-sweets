import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody } from "@/lib/api/respond";
import { otpVerifySchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/security/password";

export const dynamic = "force-dynamic";

// POST /api/auth/otp/verify — standalone phone verification (marks phone verified,
// creating a phone-only account if none exists). Login also happens via the
// NextAuth "phone" credentials provider (signIn("phone", { phone, code })).
export const POST = route(async (req) => {
  const { phone, code } = await parseBody(req, otpVerifySchema);
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, verified: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.attempts >= 5) return err("Invalid or expired code", 400);

  const valid = await verifyPassword(code, otp.codeHash);
  if (!valid) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return err("Incorrect code", 401);
  }

  await prisma.phoneOtp.update({ where: { id: otp.id }, data: { verified: true } });
  const customerRole = await prisma.role.findUnique({ where: { name: "customer" } });
  const user = await prisma.user.upsert({
    where: { phone },
    update: { phoneVerified: new Date() },
    create: { phone, name: "NERVANA Customer", roleId: customerRole?.id, phoneVerified: new Date(), customer: { create: {} } },
  });
  return ok({ verified: true, userId: user.id });
});
