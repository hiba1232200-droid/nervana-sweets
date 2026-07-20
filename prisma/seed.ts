import { PrismaClient, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

const prisma = new PrismaClient();

// Mirror of the storefront demo catalogue (kept minimal & production-shaped).
const CATEGORIES = [
  { slug: "baklava", name: "بقلاوة", nameEn: "Baklava" },
  { slug: "kunafa", name: "كنافة", nameEn: "Kunafa" },
  { slug: "maamoul", name: "معمول", nameEn: "Maamoul" },
  { slug: "turkish", name: "حلقوم", nameEn: "Turkish Delight" },
  { slug: "nuts", name: "مكسّرات فاخرة", nameEn: "Luxury Nuts" },
  { slug: "gifts", name: "علب الإهداء", nameEn: "Gift Boxes" },
];

const PERMISSIONS = [
  "dashboard.view", "products.read", "products.write", "products.delete",
  "inventory.write", "orders.read", "orders.write", "customers.read",
  "customers.write", "employees.write", "marketing.write", "content.write",
  "currency.write", "delivery.write", "reports.read", "settings.write",
];

const ROLES: Record<string, string[]> = {
  owner: ["*"],
  admin: PERMISSIONS,
  manager: ["dashboard.view", "products.read", "products.write", "inventory.write", "orders.read", "orders.write", "customers.read", "reports.read"],
  driver: ["orders.read"],
  customer: [],
};

async function main() {
  console.log("🌱 Seeding NERVANA database…");

  // Permissions
  const permMap: Record<string, string> = {};
  for (const key of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { key }, update: {},
      create: { key, label: key.replace(".", " ") },
    });
    permMap[key] = p.id;
  }

  // Roles + role-permissions
  const roleMap: Record<string, string> = {};
  for (const [name, perms] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    roleMap[name] = role.id;
    const keys = perms.includes("*") ? PERMISSIONS : perms;
    for (const k of keys) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permMap[k] } },
        update: {}, create: { roleId: role.id, permissionId: permMap[k] },
      });
    }
  }

  // Owner user (password + 2FA)
  const passwordHash = await bcrypt.hash("Nervana@2026", 12);
  const twoFactorSecret = authenticator.generateSecret();
  await prisma.user.upsert({
    where: { email: "owner@nervana.sweets" },
    update: {},
    create: {
      email: "owner@nervana.sweets",
      name: "NERVANA Owner",
      passwordHash,
      roleId: roleMap.owner,
      twoFactorEnabled: true,
      twoFactorSecret,
      emailVerified: new Date(),
    },
  });
  console.log("👑 Owner: owner@nervana.sweets / Nervana@2026");
  console.log("🔐 2FA secret (add to your authenticator):", twoFactorSecret);

  // Categories
  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug }, update: {},
      create: { slug: c.slug, name: c.name, nameEn: c.nameEn },
    });
    catMap[c.slug] = cat.id;
  }

  // A few real products with images
  const products = [
    { slug: "royal-pistachio-baklava", name: "بقلاوة الفستق الملكية", nameEn: "Royal Pistachio Baklava", cat: "baklava", price: 34, discount: 15, stock: 18, best: true, featured: true, img: "photo-1519676867240-f03562e64548" },
    { slug: "nabulsi-cheese-kunafa", name: "كنافة نابلسية بالجبن", nameEn: "Nabulsi Cheese Kunafa", cat: "kunafa", price: 28, discount: 0, stock: 9, best: true, featured: true, img: "photo-1600617953089-90b0e2f0c5e0" },
    { slug: "premium-date-maamoul", name: "معمول التمر الفاخر", nameEn: "Premium Date Maamoul", cat: "maamoul", price: 22, discount: 0, stock: 40, isNew: true, featured: true, img: "photo-1509365465985-25d11c17e812" },
    { slug: "rose-turkish-delight", name: "حلقوم الورد بالفستق", nameEn: "Rose Pistachio Turkish Delight", cat: "turkish", price: 26, discount: 20, stock: 3, img: "photo-1541599468348-e96984315921" },
    { slug: "golden-nut-assortment", name: "تشكيلة المكسّرات الذهبية", nameEn: "Golden Nut Assortment", cat: "nuts", price: 48, discount: 0, stock: 15, best: true, featured: true, img: "photo-1558326567-98ae2405596b" },
    { slug: "royal-gift-box", name: "علبة الإهداء الملكية", nameEn: "Royal Gift Box", cat: "gifts", price: 89, discount: 10, stock: 12, best: true, featured: true, img: "photo-1549007994-cb92caebd54b" },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug, name: p.name, nameEn: p.nameEn,
        description: "تحفة من الحلويات الشرقية محضّرة يدوياً من أجود المكوّنات.",
        descriptionEn: "A masterpiece of oriental confectionery, handcrafted from the finest ingredients.",
        ingredientsEn: "Premium flour, ghee, Aleppo pistachios, sugar, rose water, honey",
        allergensEn: "Contains nuts, gluten, and dairy",
        weight: "500 غ", priceUsd: p.price, discount: p.discount, stock: p.stock,
        rating: 4.8, ratingCount: 120,
        isFeatured: !!p.featured, isBestSeller: !!p.best, isNew: !!p.isNew,
        seoTitle: `${p.nameEn} | NERVANA Sweets`,
        seoDescription: `Order ${p.nameEn} — luxury oriental sweets delivered in 10–30 minutes.`,
        tags: [p.cat],
        categoryId: catMap[p.cat],
        images: { create: [{ url: `https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=1000&q=80`, alt: `${p.nameEn} — NERVANA Sweets`, position: 0 }] },
      },
    });
    void created;
  }

  // Coupons
  for (const c of [
    { code: "NERVANA10", type: CouponType.PERCENT, value: 10 },
    { code: "GOLD20", type: CouponType.PERCENT, value: 20 },
    { code: "WELCOME15", type: CouponType.PERCENT, value: 15 },
  ]) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: { ...c, active: true } });
  }

  // Delivery zone, exchange rate, settings
  await prisma.deliveryZone.create({ data: { name: "Damascus", feeUsd: 3, minOrder: 10, etaMin: 10, etaMax: 30 } }).catch(() => {});
  await prisma.exchangeRate.create({ data: { base: "USD", quote: "SYP", rate: 14500 } });
  for (const [key, value] of Object.entries({
    site_name: "NERVANA Sweets",
    currency_display: "USD",
    store_open_hour: 9,
    store_close_hour: 24,
    maintenance_mode: false,
  })) {
    await prisma.websiteSetting.upsert({ where: { key }, update: { value: value as any }, create: { key, value: value as any } });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
