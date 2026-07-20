import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser } from "@/lib/api/respond";
import { updateProfileSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// GET /api/profile — current user's profile.
export const GET = route(async () => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, email: true, phone: true, image: true, emailVerified: true, phoneVerified: true, customer: true },
  });
  return ok(user);
});

// PATCH /api/profile — edit name / avatar / phone.
export const PATCH = route(async (req) => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  const data = await parseBody(req, updateProfileSchema);
  const user = await prisma.user.update({ where: { id: u.id }, data, select: { id: true, name: true, image: true, phone: true } });
  await audit({ userId: u.id, action: "profile.update", req });
  return ok(user);
});
