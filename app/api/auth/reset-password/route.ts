import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody } from "@/lib/api/respond";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/security/password";
import { hashToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

// POST /api/auth/reset-password — set a new password via a valid reset token.
export const POST = route(async (req) => {
  const { token, password } = await parseBody(req, resetPasswordSchema);
  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return err("Invalid or expired token", 400);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { passwordHash: await hashPassword(password), tokenVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return ok({ reset: true });
});
