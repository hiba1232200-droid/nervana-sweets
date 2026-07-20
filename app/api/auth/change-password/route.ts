import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser } from "@/lib/api/respond";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// POST /api/auth/change-password — authenticated password change.
export const POST = route(async (req) => {
  const sessionUser = await currentUser();
  if (!sessionUser) return err("Unauthorized", 401);
  const { currentPassword, newPassword } = await parseBody(req, changePasswordSchema);

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.passwordHash) return err("Password change unavailable for this account", 400);
  if (!(await verifyPassword(currentPassword, user.passwordHash))) return err("Current password is incorrect", 403);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword), tokenVersion: { increment: 1 } },
  });
  await audit({ userId: user.id, action: "auth.change_password", req });
  return ok({ changed: true });
});
