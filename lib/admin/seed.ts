import { products as CATALOG, type Product } from "@/lib/data/products";
import type { Order } from "@/lib/stores/AppProvider";

// Deterministic PRNG (mulberry32) so SSR and client seeds match.
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed reference "now" for reproducible seed data.
export const REF_NOW = new Date("2026-07-18T12:00:00Z").getTime();
const DAY = 86400000;

export interface AdminProduct extends Product {
  subcategory: string;
  tags: string[];
  seoTitle: string;
  seoDesc: string;
  supplier: string;
  videoUrl: string;
  variants: { size: string; price: number }[];
  originalPrice?: number;   // captured before a discount, for "restore"
  discountStart?: string;   // scheduled discount window (ISO)
  discountEnd?: string;
}

export type MediaFolderKey = "products" | "categories" | "banners" | "promos" | "gallery" | "assets";

export interface MediaItem {
  id: string;
  folder: MediaFolderKey;
  url: string;
  filename: string;
  alt: string;
  width: number;
  height: number;
  sizeKb: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "driver";
  permissions: string[];
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  banned: boolean;
  addresses: string[];
  favorites: string[];
  orders: number;
  spending: number;
  logins: { device: string; ip: string; location: string; date: string }[];
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  uses: number;
  limit: number;
  active: boolean;
  expiry: string;
}

export interface Banner { id: string; title: string; subtitle: string; image: string; active: boolean; }
export interface ReviewMod { id: string; product: string; customer: string; rating: number; text: string; status: "pending" | "approved" | "rejected"; date: string; }
export interface Notif { id: string; type: NotifType; title: string; text: string; date: string; read: boolean; }
export type NotifType = "order" | "cancel" | "stock" | "user" | "review" | "message";
export interface LoginRecord { id: string; device: string; ip: string; location: string; date: string; success: boolean; }
export interface InventoryLog { id: string; product: string; change: number; reason: string; date: string; }

export function seedProducts(): AdminProduct[] {
  return CATALOG.map((p, i) => ({
    ...p,
    subcategory: p.category === "gifts" ? "Premium" : "Classic",
    tags: [p.category, ...(p.bestSeller ? ["best-seller"] : []), ...(p.isNew ? ["new"] : [])],
    seoTitle: `${p.nameEn} | NERVANA Sweets`,
    seoDesc: p.descEn.slice(0, 150),
    supplier: i % 2 === 0 ? "Aleppo Pistachio Co." : "Damascus Ghee House",
    videoUrl: "",
    variants: [
      { size: p.weight, price: p.price },
      { size: "1 كغ / 1kg", price: Math.round(p.price * 1.8) },
    ],
  }));
}

const NAMES = [
  ["لمى الحاج", "Lama H."], ["خالد منصور", "Khaled M."], ["سارة عبدالله", "Sara A."],
  ["رامي سعيد", "Rami S."], ["نور الدين", "Nour D."], ["هبة كريم", "Hiba K."],
  ["أحمد فارس", "Ahmad F."], ["ريم علي", "Reem A."], ["يوسف حمد", "Yousef H."],
  ["مايا زين", "Maya Z."], ["عمر خليل", "Omar K."], ["دانا وليد", "Dana W."],
];
const DEVICES = ["iPhone 15 · Safari", "Windows 11 · Chrome", "Samsung S24 · Chrome", "MacBook · Safari"];
const CITIES = ["دمشق Damascus", "حلب Aleppo", "حمص Homs", "اللاذقية Latakia"];

export function seedCustomers(): Customer[] {
  const r = rng(7);
  return NAMES.map((n, i) => {
    const orders = Math.floor(r() * 22) + 1;
    return {
      id: `C-${1000 + i}`,
      name: n[0],
      email: `${n[1].toLowerCase().replace(/[^a-z]/g, "")}@mail.com`,
      phone: `+963 9${Math.floor(r() * 90000000 + 10000000)}`,
      joined: new Date(REF_NOW - Math.floor(r() * 400) * DAY).toISOString(),
      banned: false,
      addresses: [CITIES[i % CITIES.length]],
      favorites: CATALOG.slice(i % 4, (i % 4) + 2).map((p) => p.id),
      orders,
      spending: Math.round((orders * (18 + r() * 60)) * 100) / 100,
      logins: Array.from({ length: 3 }).map((_, k) => ({
        device: DEVICES[Math.floor(r() * DEVICES.length)],
        ip: `31.9.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
        location: CITIES[Math.floor(r() * CITIES.length)],
        date: new Date(REF_NOW - k * DAY - Math.floor(r() * DAY)).toISOString(),
      })),
    };
  });
}

const STATUS_LABELS = 5; // 0..4
export function seedOrders(): Order[] {
  const r = rng(42);
  const customers = seedCustomers();
  const pays = ["Cash on Delivery", "Card", "Wallet"];
  const drivers = ["سامر — Samer", "وسيم — Wassim", "—"];
  return Array.from({ length: 40 }).map((_, i) => {
    const c = customers[i % customers.length];
    const nItems = Math.floor(r() * 3) + 1;
    const items = Array.from({ length: nItems }).map(() => {
      const p = CATALOG[Math.floor(r() * CATALOG.length)];
      const qty = Math.floor(r() * 3) + 1;
      const price = Math.round(p.price * (1 - p.discount / 100) * 100) / 100;
      return { id: p.id, qty, name: p.name, nameEn: p.nameEn, price };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = r() > 0.7 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const deliveryFee = subtotal >= 50 ? 0 : 3;
    const daysAgo = Math.floor(r() * 60);
    const roll = r();
    const state: Order["state"] = roll > 0.9 ? "cancelled" : roll > 0.85 ? "refunded" : "active";
    const status = state !== "active" ? 0 : daysAgo > 1 ? 4 : Math.floor(r() * STATUS_LABELS);
    return {
      id: "NV-" + (100000 + i * 7).toString(36).toUpperCase().slice(-6),
      date: new Date(REF_NOW - daysAgo * DAY - Math.floor(r() * DAY)).toISOString(),
      items,
      subtotal,
      discount,
      deliveryFee,
      coupon: discount ? "NERVANA10" : null,
      total: Math.round((subtotal - discount + deliveryFee) * 100) / 100,
      status,
      state,
      paymentMethod: pays[Math.floor(r() * pays.length)],
      paymentStatus: status === 4 ? "paid" : state === "refunded" ? "refunded" : "unpaid",
      driver: status >= 3 ? drivers[Math.floor(r() * (drivers.length - 1))] : "—",
      customer: {
        name: c.name,
        phone: c.phone,
        address: c.addresses[0],
        street: "شارع الجلاء · Al-Jalaa St.",
        building: String(Math.floor(r() * 40) + 1),
        notes: r() > 0.6 ? "يرجى الاتصال قبل الوصول" : "",
      },
    };
  });
}

export function seedEmployees(): Employee[] {
  return [
    { id: "E-1", name: "المالك — Owner", email: "owner@nervana.sweets", phone: "+963 900 000 000", role: "admin", permissions: ["all"], active: true },
    { id: "E-2", name: "مدير المتجر — Store Manager", email: "manager@nervana.sweets", phone: "+963 900 111 222", role: "manager", permissions: ["orders", "products", "inventory", "customers"], active: true },
    { id: "E-3", name: "سامر — Samer", email: "samer@nervana.sweets", phone: "+963 900 333 444", role: "driver", permissions: ["delivery"], active: true },
    { id: "E-4", name: "وسيم — Wassim", email: "wassim@nervana.sweets", phone: "+963 900 555 666", role: "driver", permissions: ["delivery"], active: true },
  ];
}

export function seedCoupons(): Coupon[] {
  return [
    { code: "NERVANA10", type: "percent", value: 10, uses: 128, limit: 1000, active: true, expiry: "2026-12-31" },
    { code: "GOLD20", type: "percent", value: 20, uses: 54, limit: 200, active: true, expiry: "2026-09-30" },
    { code: "WELCOME15", type: "percent", value: 15, uses: 301, limit: 0, active: true, expiry: "2027-01-31" },
    { code: "SYP5000", type: "fixed", value: 5, uses: 12, limit: 100, active: false, expiry: "2026-08-15" },
  ];
}

export function seedBanners(): Banner[] {
  return [
    { id: "B-1", title: "مجموعة العيد الفاخرة", subtitle: "Eid Luxury Collection", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=80", active: true },
    { id: "B-2", title: "توصيل خلال 10-30 دقيقة", subtitle: "Delivery in 10-30 min", image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=1000&q=80", active: true },
  ];
}

export function seedReviews(): ReviewMod[] {
  const r = rng(9);
  return NAMES.slice(0, 6).map((n, i) => ({
    id: `RV-${i + 1}`,
    product: CATALOG[i % CATALOG.length].nameEn,
    customer: n[1],
    rating: Math.floor(r() * 2) + 4,
    text: "Delicious and beautifully packaged — highly recommended!",
    status: i === 0 ? "pending" : i === 1 ? "pending" : "approved",
    date: new Date(REF_NOW - i * DAY).toISOString(),
  }));
}

export function seedNotifs(): Notif[] {
  return [
    { id: "N-1", type: "order", title: "طلب جديد — New Order", text: "NV-8XK2 · $42.00", date: new Date(REF_NOW - 3600000).toISOString(), read: false },
    { id: "N-2", type: "stock", title: "مخزون منخفض — Low Stock", text: "حلقوم الورد · 3 left", date: new Date(REF_NOW - 7200000).toISOString(), read: false },
    { id: "N-3", type: "user", title: "مستخدم جديد — New User", text: "Maya Z. registered", date: new Date(REF_NOW - 10800000).toISOString(), read: false },
    { id: "N-4", type: "review", title: "تقييم جديد — New Review", text: "★★★★★ on Royal Baklava", date: new Date(REF_NOW - 14400000).toISOString(), read: true },
    { id: "N-5", type: "message", title: "رسالة تواصل — Contact Message", text: "Question about gift boxes", date: new Date(REF_NOW - 200000000).toISOString(), read: true },
  ];
}

export function seedInventoryLog(): InventoryLog[] {
  const r = rng(3);
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `INV-${i + 1}`,
    product: CATALOG[i % CATALOG.length].nameEn,
    change: Math.floor(r() * 60) - 20,
    reason: r() > 0.5 ? "Restock" : "Sale adjustment",
    date: new Date(REF_NOW - i * DAY).toISOString(),
  }));
}

const MEDIA_SEED: { folder: MediaFolderKey; img: string; name: string }[] = [
  { folder: "products", img: "photo-1519676867240-f03562e64548", name: "royal-baklava" },
  { folder: "products", img: "photo-1600617953089-90b0e2f0c5e0", name: "kunafa" },
  { folder: "products", img: "photo-1509365465985-25d11c17e812", name: "maamoul" },
  { folder: "products", img: "photo-1558326567-98ae2405596b", name: "pistachio" },
  { folder: "categories", img: "photo-1541599468348-e96984315921", name: "turkish-delight" },
  { folder: "categories", img: "photo-1549007994-cb92caebd54b", name: "gift-boxes" },
  { folder: "banners", img: "photo-1587244141733-cc3e5f6f76b6", name: "eid-banner" },
  { folder: "banners", img: "photo-1481391319762-47dff72954d9", name: "chocolate-banner" },
  { folder: "promos", img: "photo-1548907040-4baa42d10919", name: "nougat-promo" },
  { folder: "gallery", img: "photo-1505253716362-afaea1d3d1af", name: "halva" },
  { folder: "gallery", img: "photo-1571877227200-a0d98ea607e9", name: "baklava-closeup" },
  { folder: "assets", img: "photo-1601050690597-df0568f70950", name: "dates-texture" },
];

export function seedMedia(): MediaItem[] {
  const r = rng(21);
  return MEDIA_SEED.map((m, i) => ({
    id: `M-${i + 1}`,
    folder: m.folder,
    url: `https://images.unsplash.com/${m.img}?auto=format&fit=crop&w=1000&q=80`,
    filename: `${m.name}.webp`,
    alt: `${m.name.replace(/-/g, " ")} — NERVANA Sweets`,
    width: 1000,
    height: 1000,
    sizeKb: Math.floor(r() * 180) + 60,
    createdAt: new Date(REF_NOW - i * 86400000).toISOString(),
  }));
}

export function seedLoginHistory(): LoginRecord[] {
  const r = rng(11);
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `L-${i + 1}`,
    device: DEVICES[Math.floor(r() * DEVICES.length)],
    ip: `188.40.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`,
    location: CITIES[Math.floor(r() * CITIES.length)],
    date: new Date(REF_NOW - i * DAY - Math.floor(r() * DAY)).toISOString(),
    success: i !== 2,
  }));
}
