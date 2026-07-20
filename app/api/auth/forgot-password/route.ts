import prisma from "@/lib/db/prisma";
import { ok, route, parseBody } from "@/lib/api/respond";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { generateToken, hashToken, minutesFromNow } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// POST /api/auth/forgot-password — always returns 200 (no account enumeration).
export const POST = route(async (req) => {
  const { email } = await parseBody(req, forgotPasswordSchema);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: { email, token: hashToken(token), expiresAt: minutesFromNow(30) },
    });
    await sendPasswordResetEmail(email, token);
  }
  return ok({ sent: true });
});
