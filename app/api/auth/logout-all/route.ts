import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser } from "@/lib/api/respond";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// POST /api/auth/logout-all — invalidate every active session/device.
// Bumping tokenVersion causes the JWT callback to reject all existing tokens.
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!user) return err("Unauthorized", 401);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.device.deleteMany({ where: { userId: user.id } }),
  ]);
  await audit({ userId: user.id, action: "auth.logout_all", req });
  return ok({ signedOutEverywhere: true });
});
