import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { mediaUpdateSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// PATCH /api/media/:id — rename / edit alt text / move folder.
export const PATCH = route(async (req, { params }) => {
  const user = await currentUser();
  if (!hasPermission(user, "content.write")) return err("Forbidden", 403);
  const body = await parseBody(req, mediaUpdateSchema);
  const asset = await prisma.mediaAsset.update({ where: { id: params.id }, data: body as any });
  await audit({ userId: user!.id, action: "media.update", entity: "MediaAsset", entityId: params.id, req });
  return ok(asset);
});

// DELETE /api/media/:id
export const DELETE = route(async (req, { params }) => {
  const user = await currentUser();
  if (!hasPermission(user, "content.write")) return err("Forbidden", 403);
  await prisma.mediaAsset.delete({ where: { id: params.id } });
  await audit({ userId: user!.id, action: "media.delete", entity: "MediaAsset", entityId: params.id, req });
  return ok({ id: params.id });
});
