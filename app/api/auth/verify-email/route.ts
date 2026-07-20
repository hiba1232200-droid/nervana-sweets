import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody } from "@/lib/api/respond";
import { verifyEmailSchema } from "@/lib/validation/schemas";
import { hashToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

// POST /api/auth/verify-email — confirm email via token.
export const POST = route(async (req) => {
  const { token } = await parseBody(req, verifyEmailSchema);
  const record = await prisma.emailVerificationToken.findUnique({ where: { token: hashToken(token) } });
  if (!record || record.expiresAt < new Date()) return err("Invalid or expired link", 400);

  await prisma.$transaction([
    prisma.user.update({ where: { email: record.email }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { email: record.email } }),
  ]);
  return ok({ verified: true });
});
