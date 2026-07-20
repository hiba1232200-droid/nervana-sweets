import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { productSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// GET /api/products/:id  (id or slug)
export const GET = route(async (_req, { params }) => {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { images: { orderBy: { position: "asc" } }, variants: true, category: true, reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true, image: true } } } } },
  });
  if (!product) return err("Not found", 404);
  return ok(product);
});

// PATCH /api/products/:id  (RBAC: products.write)
export const PATCH = route(async (req, { params }) => {
  const user = await currentUser();
  if (!hasPermission(user, "products.write")) return err("Forbidden", 403);
  const body = await parseBody(req, productSchema.partial());
  const product = await prisma.product.update({ where: { id: params.id }, data: body as any });
  await audit({ userId: user!.id, action: "product.update", entity: "Product", entityId: params.id, req });
  return ok(product);
});

// DELETE /api/products/:id  (RBAC: products.delete)
export const DELETE = route(async (req, { params }) => {
  const user = await currentUser();
  if (!hasPermission(user, "products.delete")) return err("Forbidden", 403);
  await prisma.product.delete({ where: { id: params.id } });
  await audit({ userId: user!.id, action: "product.delete", entity: "Product", entityId: params.id, req });
  return ok({ id: params.id });
});
