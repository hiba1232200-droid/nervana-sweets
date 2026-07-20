import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { productSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || `p-${Date.now()}`;

// GET /api/products?category=&featured=&bestSeller=&take=
export const GET = route(async (req) => {
  const { searchParams } = new URL(req.url);
  const where: any = { isActive: true };
  if (searchParams.get("category")) where.category = { slug: searchParams.get("category") };
  if (searchParams.get("featured") === "true") where.isFeatured = true;
  if (searchParams.get("bestSeller") === "true") where.isBestSeller = true;
  const take = Math.min(48, Number(searchParams.get("take") ?? 24));

  const products = await prisma.product.findMany({
    where,
    take,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  return ok(products);
});

// POST /api/products  (RBAC: products.write)
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "products.write")) return err("Forbidden", 403);

  const body = await parseBody(req, productSchema);
  const product = await prisma.product.create({
    data: {
      slug: slugify(body.nameEn),
      name: body.name,
      nameEn: body.nameEn,
      description: body.descriptionEn ?? "",
      descriptionEn: body.descriptionEn ?? "",
      ingredientsEn: body.ingredientsEn,
      allergensEn: body.allergensEn,
      weight: body.weight,
      priceUsd: body.priceUsd,
      discount: body.discount,
      stock: body.stock,
      tags: body.tags,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      categoryId: body.categoryId,
    },
  });
  await audit({ userId: user!.id, action: "product.create", entity: "Product", entityId: product.id, req });
  return ok(product, 201);
});
