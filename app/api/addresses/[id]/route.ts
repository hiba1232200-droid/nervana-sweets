import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser } from "@/lib/api/respond";
import { addressSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

async function owns(userId: string, id: string) {
  const a = await prisma.address.findUnique({ where: { id } });
  return a && a.userId === userId ? a : null;
}

// PATCH /api/addresses/:id
export const PATCH = route(async (req, { params }) => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  if (!(await owns(u.id, params.id))) return err("Not found", 404);
  const body = await parseBody(req, addressSchema.partial());
  if ((body as any).isDefault) {
    await prisma.address.updateMany({ where: { userId: u.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.update({ where: { id: params.id }, data: body as any });
  return ok(address);
});

// DELETE /api/addresses/:id
export const DELETE = route(async (_req, { params }) => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  if (!(await owns(u.id, params.id))) return err("Not found", 404);
  await prisma.address.delete({ where: { id: params.id } });
  return ok({ id: params.id });
});
