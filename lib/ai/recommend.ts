import prisma from "@/lib/db/prisma";

// Lightweight recommendation engine over the orders graph.
// (Swap for a vector/collaborative-filtering service as the catalogue grows.)

/** Popular products — ranked by units sold, then rating. */
export async function popularProducts(limit = 8) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  const ids = grouped.map((g) => g.productId);
  if (!ids.length) {
    return prisma.product.findMany({ where: { isActive: true }, orderBy: { ratingCount: "desc" }, take: limit });
  }
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: { images: true } });
  return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
}

/** Frequently bought together — co-occurrence with the given product. */
export async function frequentlyBoughtTogether(productId: string, limit = 4) {
  const orders = await prisma.order.findMany({
    where: { items: { some: { productId } } },
    select: { items: { select: { productId: true } } },
    take: 500,
  });
  const counts = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      if (it.productId !== productId) counts.set(it.productId, (counts.get(it.productId) ?? 0) + 1);
    }
  }
  const ids = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
  if (!ids.length) return [];
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: { images: true } });
  return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
}

/** Personalised suggestions from a customer's purchase & favourite history. */
export async function personalizedForUser(userId: string, limit = 8) {
  const [orders, customer] = await Promise.all([
    prisma.order.findMany({ where: { userId }, select: { items: { select: { product: { select: { categoryId: true } } } } }, take: 50 }),
    prisma.customer.findUnique({ where: { userId } }),
  ]);
  const catWeight = new Map<string, number>();
  orders.forEach((o) => o.items.forEach((it) => {
    const c = it.product.categoryId;
    catWeight.set(c, (catWeight.get(c) ?? 0) + 1);
  }));
  const topCats = [...catWeight.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  const exclude = customer?.favorites ?? [];

  const products = await prisma.product.findMany({
    where: { isActive: true, id: { notIn: exclude }, ...(topCats.length ? { categoryId: { in: topCats } } : {}) },
    orderBy: [{ isBestSeller: "desc" }, { rating: "desc" }],
    take: limit,
    include: { images: true },
  });
  if (products.length >= limit) return products;
  // top-up with best sellers
  const extra = await prisma.product.findMany({
    where: { isActive: true, id: { notIn: [...exclude, ...products.map((p) => p.id)] } },
    orderBy: { isBestSeller: "desc" }, take: limit - products.length, include: { images: true },
  });
  return [...products, ...extra];
}

/** Search autocomplete — prefix/contains match on names & tags. */
export async function searchAutocomplete(q: string, limit = 6) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { nameEn: { contains: q, mode: "insensitive" } },
        { name: { contains: q } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    take: limit,
    select: { id: true, slug: true, name: true, nameEn: true, priceUsd: true, images: { take: 1 } },
  });
}
