"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { dictionary, type Lang } from "@/lib/i18n/dictionary";
import { products as ALL, discountedPrice, type Product } from "@/lib/data/products";
import { playSfx } from "@/lib/audio/sfx";

export type Currency = "USD" | "SYP";
export type DisplayMode = "USD" | "SYP" | "both";
export interface CartItem { id: string; qty: number; }
export interface Order {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  coupon?: string | null;
  items: { id: string; qty: number; name: string; nameEn: string; price: number }[];
  status: number; // 0..4  Pending → Preparing → Ready → Out for Delivery → Delivered
  state?: "active" | "cancelled" | "refunded";
  paymentMethod?: string;
  paymentStatus?: "paid" | "unpaid" | "refunded";
  driver?: string;
  customer: { name: string; phone: string; address: string; street: string; building: string; notes: string };
}

export interface StoreSettings {
  deliveryFee: number;
  minOrder: number;
  freeDeliveryOver: number;
  openHour: number;   // 0-23
  closeHour: number;  // 0-24
  manualClosed: boolean;
  maintenanceMode: boolean;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  deliveryFee: 3,
  minOrder: 10,
  freeDeliveryOver: 50,
  openHour: 9,
  closeHour: 24,
  manualClosed: false,
  maintenanceMode: false,
};

export interface RatePoint { at: number; rate: number; source: string; }

// Deterministic demo history (fixed base → no SSR/client hydration mismatch).
const RATE_BASE_TS = 1_752_800_000_000; // fixed reference timestamp
function seedRateHistory(): RatePoint[] {
  const pts: RatePoint[] = [];
  let rate = 13800;
  for (let i = 30; i >= 0; i--) {
    // smooth deterministic drift upward with small oscillation
    rate = Math.round(13800 + (30 - i) * 22 + Math.sin(i / 2) * 60);
    pts.push({ at: RATE_BASE_TS - i * 86400000, rate, source: i === 0 ? "telegram" : "provider" });
  }
  return pts.reverse();
}

// Map a notification kind to its subscribable topic group.
export function topicOf(kind: NotifKind): string {
  if (kind === "order" || kind === "payment" || kind === "restock") return "orders";
  if (kind === "discount" || kind === "coupon" || kind === "flash") return "discounts";
  if (kind === "product") return "products";
  return "offers"; // seasonal | loyalty | birthday | system
}

// Deterministic seed so the notification center isn't empty (fixed timestamps).
function seedCustomerNotifs(): CustomerNotif[] {
  const H = 3600000;
  return [
    { id: "seed1", kind: "flash", title: "⚡ عرض خاطف — Flash Sale", body: "خصم 25٪ على النوغا الفاخرة لساعة واحدة فقط!", at: RATE_BASE_TS - 2 * H, read: false, href: "/products" },
    { id: "seed2", kind: "loyalty", title: "⭐ نقاط ولاء — Loyalty Points", body: "حصلت على 120 نقطة جديدة من طلبك الأخير.", at: RATE_BASE_TS - 26 * H, read: false },
    { id: "seed3", kind: "restock", title: "🔔 عاد للتوفّر — Back in Stock", body: "كنافة نابلسية بالجبن متوفّرة الآن مجدداً.", at: RATE_BASE_TS - 50 * H, read: true, href: "/products/p2" },
    { id: "seed4", kind: "discount", title: "🎉 خصومات جديدة — New Discounts", body: "استخدم كود GOLD20 للحصول على خصم 20٪.", at: RATE_BASE_TS - 74 * H, read: true },
  ];
}
export interface User {
  name: string;
  email: string;
  phone: string;
  method: "email" | "google" | "phone";
  loyalty: number;
  avatar?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  street: string;
  building?: string;
  notes?: string;
}

export type NotifKind =
  | "order" | "payment" | "discount" | "product" | "seasonal"
  | "loyalty" | "coupon" | "birthday" | "restock" | "flash" | "system";

export interface CustomerNotif {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
  href?: string;
}
export interface Toast { id: string; kind: NotifKind; title: string; body: string; }

export type IntroScene = "default" | "eid" | "ramadan" | "wedding" | "custom";
export type PromoPlacement = "home" | "product" | "banner" | "popup";
export interface Promo {
  id: string;
  title: string;
  titleEn: string;
  discountPercent: number;
  productIds: string[];
  startsAt: number;
  endsAt: number;
  placements: PromoPlacement[];
  couponCode?: string;
  active: boolean;
}

// Fixed far-future end so the seeded promo always counts down (deterministic).
const PROMO_END = Date.UTC(2026, 11, 31, 21, 0, 0);
const PROMO_START = Date.UTC(2026, 0, 1, 0, 0, 0);
function seedPromos(): Promo[] {
  return [
    {
      id: "promo-flash", title: "عرض ذهبي خاطف", titleEn: "Golden Flash Sale",
      discountPercent: 25, productIds: ["p1", "p9", "p4"],
      startsAt: PROMO_START, endsAt: PROMO_END,
      placements: ["home", "popup", "banner"], couponCode: "GOLD20", active: true,
    },
  ];
}

export function isPromoLive(p: Promo, now = Date.now()): boolean {
  return p.active && now >= p.startsAt && now <= p.endsAt;
}

export interface SeasonalTheme {
  key: string;
  name: string;
  nameEn: string;
  accent: string;      // primary accent (hex)
  accent2: string;     // secondary accent
  particle: string;    // particle colour
  taglineAr?: string;
  taglineEn?: string;
  bannerAr?: string;
  bannerEn?: string;
  heroImage?: string;  // custom uploaded asset
  ornament: "diamond" | "crescent" | "star" | "heart" | "snow" | "cap";
  startsAt?: number;   // optional schedule window (epoch ms)
  endsAt?: number;
  enabled: boolean;
}

export function seedThemes(): SeasonalTheme[] {
  const T = (o: Partial<SeasonalTheme> & Pick<SeasonalTheme, "key" | "name" | "nameEn" | "accent" | "ornament">): SeasonalTheme =>
    ({ accent2: "#E8C766", particle: "#D4AF37", enabled: true, ...o });
  return [
    T({ key: "default", name: "الافتراضي الذهبي", nameEn: "Default Gold", accent: "#D4AF37", accent2: "#E8C766", ornament: "diamond", bannerAr: "توصيل خلال 10-30 دقيقة", bannerEn: "Delivery in 10–30 minutes" }),
    T({ key: "ramadan", name: "رمضان", nameEn: "Ramadan", accent: "#8B5CF6", accent2: "#D4AF37", particle: "#C4B5FD", ornament: "crescent", taglineAr: "رمضان كريم", taglineEn: "Ramadan Kareem", bannerAr: "مجموعة رمضان الفاخرة", bannerEn: "The luxury Ramadan collection" }),
    T({ key: "eid-fitr", name: "عيد الفطر", nameEn: "Eid Al-Fitr", accent: "#34D399", accent2: "#D4AF37", particle: "#6EE7B7", ornament: "crescent", taglineAr: "عيد فطر مبارك", taglineEn: "Eid Al-Fitr Mubarak", bannerAr: "حلويات العيد وصلت", bannerEn: "Eid sweets have arrived" }),
    T({ key: "eid-adha", name: "عيد الأضحى", nameEn: "Eid Al-Adha", accent: "#10B981", accent2: "#D4AF37", particle: "#6EE7B7", ornament: "star", taglineAr: "عيد أضحى مبارك", taglineEn: "Eid Al-Adha Mubarak" }),
    T({ key: "mothers", name: "عيد الأم", nameEn: "Mother's Day", accent: "#F472B6", accent2: "#F9A8D4", particle: "#FBCFE8", ornament: "heart", taglineAr: "أمي حبيبتي", taglineEn: "For the best Mom" }),
    T({ key: "valentine", name: "عيد الحب", nameEn: "Valentine's", accent: "#FB7185", accent2: "#F43F5E", particle: "#FDA4AF", ornament: "heart", taglineAr: "بمحبة", taglineEn: "With love" }),
    T({ key: "graduation", name: "موسم التخرّج", nameEn: "Graduation", accent: "#38BDF8", accent2: "#D4AF37", particle: "#7DD3FC", ornament: "cap", taglineAr: "مبروك التخرّج", taglineEn: "Congrats grad!" }),
    T({ key: "summer", name: "الصيف", nameEn: "Summer", accent: "#FBBF24", accent2: "#F59E0B", particle: "#FDE68A", ornament: "star", taglineAr: "نكهات الصيف", taglineEn: "Summer flavours" }),
    T({ key: "winter", name: "الشتاء", nameEn: "Winter", accent: "#60A5FA", accent2: "#93C5FD", particle: "#DBEAFE", ornament: "snow", taglineAr: "دفء الشتاء", taglineEn: "Winter warmth" }),
    T({ key: "newyear", name: "رأس السنة", nameEn: "New Year", accent: "#E8C766", accent2: "#F0E0B0", particle: "#FFFFFF", ornament: "star", taglineAr: "سنة سعيدة", taglineEn: "Happy New Year" }),
    T({ key: "national", name: "العيد الوطني", nameEn: "National Day", accent: "#EF4444", accent2: "#D4AF37", particle: "#FCA5A5", ornament: "star", taglineAr: "بلدي الحبيب", taglineEn: "Proudly local" }),
    T({ key: "custom", name: "حدث مخصّص", nameEn: "Custom Event", accent: "#D4AF37", accent2: "#E8C766", particle: "#D4AF37", ornament: "diamond", enabled: false }),
  ];
}

export type Daypart = "morning" | "day" | "sunset" | "night";
export function daypartFromHour(h: number): Daypart {
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 20) return "sunset";
  return "night";
}
export const DAYPART_ACCENT: Record<Daypart, string> = {
  morning: "#F4C77B",
  day: "#E8C766",
  sunset: "#F59E5B",
  night: "#D4AF37",
};

export function resolveActiveTheme(themes: SeasonalTheme[], override: string, now = Date.now()): SeasonalTheme {
  const fallback = themes.find((t) => t.key === "default") ?? themes[0];
  if (override && override !== "auto") return themes.find((t) => t.key === override) ?? fallback;
  const scheduled = themes.find((t) => t.enabled && t.startsAt && t.endsAt && now >= t.startsAt && now <= t.endsAt);
  return scheduled ?? fallback;
}

interface AppState {
  // i18n
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (typeof dictionary)["ar"];
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  // currency — SYP rate & display mode set by Admin Dashboard (configurable)
  currency: Currency;
  sypRate: number;
  rateUpdatedAt: number;
  rateSource: string;
  rateHistory: RatePoint[];
  exchangeAuto: boolean;
  syncIntervalSec: number;
  connectionOk: boolean;
  lastRateError: string;
  displayMode: DisplayMode;
  setCurrency: (c: Currency) => void;
  setSypRate: (r: number) => void;
  updateRate: (rate: number, source?: string) => void;
  restoreRate: (at: number) => void;
  setExchangeAuto: (v: boolean) => void;
  setSyncIntervalSec: (n: number) => void;
  setDisplayMode: (m: DisplayMode) => void;
  format: (usd: number) => string;
  // store settings (admin-controlled) + open state
  settings: StoreSettings;
  setSettings: (s: Partial<StoreSettings>) => void;
  deliveryFee: number;
  storeOpen: boolean;
  // cart
  cart: CartItem[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  // wishlist / favorites
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  // compare
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  // recently viewed / purchased
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  recentlyPurchased: string[];
  // coupons / loyalty
  coupon: { code: string; percent: number } | null;
  applyCoupon: (code: string) => boolean;
  useLoyalty: boolean;
  setUseLoyalty: (v: boolean) => void;
  // auth
  user: User | null;
  login: (u: Partial<User> & { method: User["method"] }) => void;
  logout: () => void;
  editProfile: (patch: Partial<User>) => void;
  logoutAll: () => void;
  savedAddresses: SavedAddress[];
  addAddress: (a: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
  // customer notifications
  notifications: CustomerNotif[];
  toasts: Toast[];
  notify: (kind: NotifKind, title: string, body: string, href?: string) => void;
  dismissToast: (id: string) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  clearNotifs: () => void;
  unreadNotifs: number;
  notifSound: boolean;
  setNotifSound: (v: boolean) => void;
  notifTopics: string[];
  toggleNotifTopic: (topic: string) => void;
  // seasonal themes
  themes: SeasonalTheme[];
  themeOverride: string;
  activeTheme: SeasonalTheme;
  setThemeOverride: (key: string) => void;
  addTheme: (t: SeasonalTheme) => void;
  updateTheme: (key: string, patch: Partial<SeasonalTheme>) => void;
  removeTheme: (key: string) => void;
  // reduced-motion / performance mode
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  // dynamic day & night
  daypart: Daypart;
  dayNightEnabled: boolean;
  daypartOverride: string; // "auto" | Daypart
  lightIntensity: number;
  animIntensity: number;
  setDayNightEnabled: (v: boolean) => void;
  setDaypartOverride: (v: string) => void;
  setLightIntensity: (n: number) => void;
  setAnimIntensity: (n: number) => void;
  // luxury intro
  introEnabled: boolean;
  introDuration: number;
  introScene: IntroScene;
  introModelUrl: string;
  introSeen: boolean;
  setIntroEnabled: (v: boolean) => void;
  setIntroDuration: (n: number) => void;
  setIntroScene: (s: IntroScene) => void;
  setIntroModelUrl: (u: string) => void;
  markIntroSeen: () => void;
  replayIntro: () => void;
  // countdown promotions
  promotions: Promo[];
  activePromos: Promo[];
  addPromo: (p: Omit<Promo, "id">) => void;
  updatePromo: (id: string, patch: Partial<Promo>) => void;
  removePromo: (id: string) => void;
  claimedPromos: string[];
  claimPromo: (id: string) => string | null;
  // orders
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "date" | "status">) => Order;
  advanceOrder: (id: string) => void;
  // drawers / ui
  ui: { cart: boolean; wishlist: boolean; compare: boolean; search: boolean; auth: boolean; chat: boolean; notifs: boolean };
  openUi: (k: keyof AppState["ui"]) => void;
  closeUi: (k: keyof AppState["ui"]) => void;
}

const Ctx = createContext<AppState | null>(null);

const COUPONS: Record<string, number> = { NERVANA10: 10, GOLD20: 20, WELCOME15: 15 };
const DELIVERY_FEE_USD = 3;

function usePersisted<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Arabic is the DEFAULT language for all visitors
  const [lang, setLangState] = usePersisted<Lang>("nv_lang", "ar");
  const [currency, setCurrency] = usePersisted<Currency>("nv_currency", "USD");
  const [sypRate, setSypRateState] = usePersisted<number>("nv_syp_rate", 14500); // admin-configurable
  const [rateUpdatedAt, setRateUpdatedAt] = usePersisted<number>("nv_rate_updated", 0);
  const [rateSource, setRateSource] = usePersisted<string>("nv_rate_source", "manual");
  const [rateHistory, setRateHistory] = usePersisted<RatePoint[]>("nv_rate_history", seedRateHistory());
  const [exchangeAuto, setExchangeAuto] = usePersisted<boolean>("nv_exchange_auto", true);
  const [syncIntervalSec, setSyncIntervalSec] = usePersisted<number>("nv_sync_interval", 60);
  const [connectionOk, setConnectionOk] = useState(true);
  const [lastRateError, setLastRateError] = useState("");

  const updateRate = useCallback((r: number, source = "manual") => {
    setSypRateState(r);
    const at = Date.now();
    setRateUpdatedAt(at);
    setRateSource(source);
    setRateHistory((h) => [{ at, rate: r, source }, ...h].slice(0, 500));
  }, [setSypRateState, setRateUpdatedAt, setRateSource, setRateHistory]);

  const setSypRate = useCallback((r: number) => updateRate(r, "manual"), [updateRate]);
  const restoreRate = useCallback((at: number) => {
    setRateHistory((h) => {
      const p = h.find((x) => x.at === at);
      if (p) updateRate(p.rate, "restore");
      return h;
    });
  }, [setRateHistory, updateRate]);

  // Background sync poller — pulls the latest server rate at the configured
  // interval and updates prices/carts site-wide. Keeps the last rate on failure.
  const failRef = React.useRef(0);
  useEffect(() => {
    if (!exchangeAuto) return;
    const tick = async () => {
      try {
        const res = await fetch("/api/currency", { cache: "no-store" });
        if (res.ok) {
          const j = await res.json();
          const r = j?.data?.rate;
          failRef.current = 0; setConnectionOk(true); setLastRateError("");
          if (typeof r === "number" && Math.abs(r - sypRate) / sypRate >= 0.0005) updateRate(Math.round(r), "auto");
        }
      } catch {
        failRef.current += 1;
        if (failRef.current >= 3) { setConnectionOk(false); setLastRateError("Rate source unreachable — using last saved rate."); }
      }
    };
    const id = setInterval(tick, Math.max(30, syncIntervalSec) * 1000);
    return () => clearInterval(id);
  }, [exchangeAuto, syncIntervalSec, sypRate, updateRate]);
  const [displayMode, setDisplayMode] = usePersisted<DisplayMode>("nv_display_mode", "USD");
  const [settings, setSettingsState] = usePersisted<StoreSettings>("nv_settings", DEFAULT_SETTINGS);
  const [cart, setCart] = usePersisted<CartItem[]>("nv_cart", []);
  const [wishlist, setWishlist] = usePersisted<string[]>("nv_wishlist", []);
  const [favorites, setFavorites] = usePersisted<string[]>("nv_favorites", []);
  const [compare, setCompare] = usePersisted<string[]>("nv_compare", []);
  const [recentlyViewed, setRecentlyViewed] = usePersisted<string[]>("nv_recent", []);
  const [recentlyPurchased, setRecentlyPurchased] = usePersisted<string[]>("nv_purchased", []);
  const [coupon, setCoupon] = usePersisted<AppState["coupon"]>("nv_coupon", null);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [user, setUser] = usePersisted<User | null>("nv_user", null);
  const [savedAddresses, setSavedAddresses] = usePersisted<SavedAddress[]>("nv_addresses", [
    { id: "addr-home", label: "المنزل — Home", fullName: "زائر كريم", phone: "+963 900 000 000", city: "دمشق Damascus", street: "شارع الجلاء — Al-Jalaa St.", building: "12" },
  ]);
  const [orders, setOrders] = usePersisted<Order[]>("nv_orders", []);
  const [ui, setUi] = useState<AppState["ui"]>({
    cart: false, wishlist: false, compare: false, search: false, auth: false, chat: false, notifs: false,
  });

  // ---- customer notifications ----
  const [notifications, setNotifications] = usePersisted<CustomerNotif[]>("nv_cust_notifs", seedCustomerNotifs());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifSound, setNotifSound] = usePersisted<boolean>("nv_notif_sound", true);
  const [notifTopics, setNotifTopics] = usePersisted<string[]>("nv_notif_topics", ["orders", "discounts", "products", "offers"]);

  const notify = useCallback(
    (kind: NotifKind, title: string, body: string, href?: string) => {
      const id = "n" + Math.random().toString(36).slice(2, 9);
      const at = Date.now();
      setNotifications((prev) => [{ id, kind, title, body, at, read: false, href }, ...prev].slice(0, 120));
      if (notifTopics.includes(topicOf(kind))) { setToasts((t) => [...t, { id, kind, title, body }]); playSfx("notify"); }
    },
    [setNotifications, notifTopics]
  );
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const markNotifRead = useCallback((id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))), [setNotifications]);
  const markAllNotifsRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), [setNotifications]);
  const clearNotifs = useCallback(() => setNotifications([]), [setNotifications]);
  const toggleNotifTopic = useCallback((topic: string) => setNotifTopics((s) => (s.includes(topic) ? s.filter((x) => x !== topic) : [...s, topic])), [setNotifTopics]);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const dir = dictionary[lang].dir as "rtl" | "ltr";
  const t = dictionary[lang];

  // keep <html> attributes in sync
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), [setLangState]);
  const toggleLang = useCallback(
    () => setLangState((p) => (p === "ar" ? "en" : "ar")),
    [setLangState]
  );

  const usdStr = (usd: number) => `$${usd.toFixed(2)}`;
  const sypStr = useCallback(
    (usd: number) => {
      const s = Math.round(usd * sypRate).toLocaleString(lang === "ar" ? "ar-SY" : "en-US");
      return lang === "ar" ? `${s} ل.س` : `SYP ${s}`;
    },
    [sypRate, lang]
  );

  // Display mode (admin): USD only, SYP only, or both simultaneously.
  const format = useCallback(
    (usd: number) => {
      if (displayMode === "both") return `${usdStr(usd)} · ${sypStr(usd)}`;
      const active = displayMode === "SYP" || currency === "SYP" ? "SYP" : "USD";
      return active === "USD" ? usdStr(usd) : sypStr(usd);
    },
    [displayMode, currency, sypStr]
  );

  const setSettings = useCallback(
    (s: Partial<StoreSettings>) => setSettingsState((prev) => ({ ...prev, ...s })),
    [setSettingsState]
  );

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(i);
  }, []);
  const hour = now.getHours();
  const withinHours =
    settings.closeHour > settings.openHour
      ? hour >= settings.openHour && hour < settings.closeHour
      : hour >= settings.openHour || hour < settings.closeHour;
  const storeOpen = !settings.manualClosed && !settings.maintenanceMode && withinHours;
  const deliveryFee = settings.deliveryFee;

  const priceOf = (id: string) => {
    const p = ALL.find((x) => x.id === id);
    return p ? discountedPrice(p) : 0;
  };

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      playSfx("add");
      setCart((c) => {
        const e = c.find((i) => i.id === id);
        if (e) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
        return [...c, { id, qty }];
      });
      setUi((u) => ({ ...u, cart: true }));
    },
    [setCart]
  );
  const removeFromCart = useCallback((id: string) => { playSfx("remove"); setCart((c) => c.filter((i) => i.id !== id)); }, [setCart]);
  const setQty = useCallback(
    (id: string, qty: number) =>
      setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    [setCart]
  );
  const clearCart = useCallback(() => setCart([]), [setCart]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + priceOf(i.id) * i.qty, 0);

  const toggleWishlist = useCallback(
    (id: string) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    [setWishlist]
  );
  const toggleFavorite = useCallback(
    (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    [setFavorites]
  );
  const toggleCompare = useCallback(
    (id: string) =>
      setCompare((c) =>
        c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? c : [...c, id]
      ),
    [setCompare]
  );
  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  const addRecentlyViewed = useCallback(
    (id: string) => setRecentlyViewed((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
    [setRecentlyViewed]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const percent = COUPONS[code.trim().toUpperCase()];
      if (percent) {
        setCoupon({ code: code.trim().toUpperCase(), percent });
        playSfx("coupon");
        return true;
      }
      return false;
    },
    [setCoupon]
  );

  // ---- luxury intro ----
  const [introEnabled, setIntroEnabled] = usePersisted<boolean>("nv_intro_enabled", true);
  const [introDuration, setIntroDuration] = usePersisted<number>("nv_intro_duration", 4);
  const [introScene, setIntroScene] = usePersisted<IntroScene>("nv_intro_scene", "default");
  const [introModelUrl, setIntroModelUrl] = usePersisted<string>("nv_intro_model", "");
  const [introSeen, setIntroSeen] = usePersisted<boolean>("nv_intro_seen", false);
  const markIntroSeen = useCallback(() => setIntroSeen(true), [setIntroSeen]);
  const replayIntro = useCallback(() => setIntroSeen(false), [setIntroSeen]);

  // ---- countdown promotions ----
  const [promotions, setPromotions] = usePersisted<Promo[]>("nv_promos", seedPromos());
  const [claimedPromos, setClaimedPromos] = usePersisted<string[]>("nv_claimed_promos", []);
  const activePromos = useMemo(() => promotions.filter((p) => isPromoLive(p)), [promotions]);

  const addPromo = useCallback((p: Omit<Promo, "id">) => {
    const promo: Promo = { ...p, id: "promo-" + Math.random().toString(36).slice(2, 7) };
    setPromotions((prev) => [promo, ...prev]);
    const ar = lang === "ar";
    notify("flash", ar ? "عرض جديد متاح! ⚡" : "New promotion available! ⚡", ar ? promo.title : promo.titleEn, "/");
  }, [setPromotions, notify, lang]);
  const updatePromo = useCallback((id: string, patch: Partial<Promo>) =>
    setPromotions((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))), [setPromotions]);
  const removePromo = useCallback((id: string) =>
    setPromotions((prev) => prev.filter((x) => x.id !== id)), [setPromotions]);
  const claimPromo = useCallback((id: string): string | null => {
    const p = promotions.find((x) => x.id === id);
    if (!p || !isPromoLive(p)) return null;
    setClaimedPromos((s) => (s.includes(id) ? s : [...s, id]));
    if (p.couponCode) applyCoupon(p.couponCode);
    const ar = lang === "ar";
    notify("discount", ar ? "تم تفعيل العرض! 🎉" : "Promotion claimed! 🎉",
      p.couponCode ? (ar ? `تم تطبيق الكود ${p.couponCode}` : `Applied code ${p.couponCode}`) : (ar ? "تم تفعيل العرض" : "Promotion activated"));
    return p.couponCode ?? null;
  }, [promotions, setClaimedPromos, applyCoupon, notify, lang]);

  // ---- seasonal themes ----
  const [themes, setThemes] = usePersisted<SeasonalTheme[]>("nv_themes", seedThemes());
  const [themeOverride, setThemeOverride] = usePersisted<string>("nv_theme_override", "auto");
  const activeTheme = useMemo(() => resolveActiveTheme(themes, themeOverride), [themes, themeOverride]);
  const addTheme = useCallback((tm: SeasonalTheme) => setThemes((prev) => [...prev.filter((x) => x.key !== tm.key), tm]), [setThemes]);
  const updateTheme = useCallback((key: string, patch: Partial<SeasonalTheme>) => setThemes((prev) => prev.map((x) => (x.key === key ? { ...x, ...patch } : x))), [setThemes]);
  const removeTheme = useCallback((key: string) => setThemes((prev) => prev.filter((x) => x.key !== key || x.key === "default")), [setThemes]);

  // ---- reduced-motion / performance mode ----
  const [reducedMotion, setReducedMotionState] = usePersisted<boolean>("nv_reduced_motion", false);
  const setReducedMotion = useCallback((v: boolean) => setReducedMotionState(v), [setReducedMotionState]);

  // apply active theme + motion preference to <html>
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = activeTheme.key;
    el.style.setProperty("--accent", activeTheme.accent);
    el.style.setProperty("--accent-2", activeTheme.accent2);
    el.style.setProperty("--particle", activeTheme.particle);
  }, [activeTheme]);
  useEffect(() => {
    document.documentElement.dataset.reduced = reducedMotion ? "true" : "false";
  }, [reducedMotion]);
  useEffect(() => {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && localStorage.getItem("nv_reduced_motion") === null) {
        setReducedMotionState(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- dynamic day & night ----
  const [dayNightEnabled, setDayNightEnabled] = usePersisted<boolean>("nv_daynight", true);
  const [daypartOverride, setDaypartOverride] = usePersisted<string>("nv_daypart_override", "auto");
  const [lightIntensity, setLightIntensity] = usePersisted<number>("nv_light_intensity", 1);
  const [animIntensity, setAnimIntensity] = usePersisted<number>("nv_anim_intensity", 1);
  const daypart = useMemo<Daypart>(() => {
    if (!dayNightEnabled) return "day";
    if (daypartOverride !== "auto") return daypartOverride as Daypart;
    return daypartFromHour(now.getHours());
  }, [dayNightEnabled, daypartOverride, now]);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.daypart = daypart;
    el.style.setProperty("--daypart-accent", DAYPART_ACCENT[daypart]);
  }, [daypart]);

  const login = useCallback(
    (u: Partial<User> & { method: User["method"] }) => {
      playSfx("login");
      setUser({
        name: u.name || (u.method === "google" ? "Google User" : "زائر كريم"),
        email: u.email || "guest@nervana.sweets",
        phone: u.phone || "",
        method: u.method,
        loyalty: 1250,
      });
    },
    [setUser]
  );
  const logout = useCallback(() => setUser(null), [setUser]);
  const editProfile = useCallback(
    (patch: Partial<User>) => setUser((u) => (u ? { ...u, ...patch } : u)),
    [setUser]
  );
  const logoutAll = useCallback(() => setUser(null), [setUser]);
  const addAddress = useCallback(
    (a: Omit<SavedAddress, "id">) =>
      setSavedAddresses((list) => [...list, { ...a, id: "addr-" + Math.random().toString(36).slice(2, 7) }]),
    [setSavedAddresses]
  );
  const removeAddress = useCallback(
    (id: string) => setSavedAddresses((list) => list.filter((x) => x.id !== id)),
    [setSavedAddresses]
  );

  const placeOrder = useCallback(
    (o: Omit<Order, "id" | "date" | "status">) => {
      const order: Order = {
        state: "active",
        paymentMethod: o.paymentMethod || "Cash on Delivery",
        paymentStatus: "unpaid",
        driver: "",
        ...o,
        id: "NV-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: new Date().toISOString(),
        status: 0,
      };
      setOrders((prev) => [order, ...prev]);
      setRecentlyPurchased((prev) => [
        ...o.items.map((i) => i.id),
        ...prev,
      ].filter((v, idx, a) => a.indexOf(v) === idx).slice(0, 8));
      setCart([]);
      setCoupon(null);
      setUseLoyalty(false);
      const earned = Math.round(o.total);
      if (user) setUser({ ...user, loyalty: user.loyalty + earned });
      playSfx("order");
      const ar = lang === "ar";
      notify("order", ar ? "تم استلام طلبك ✅" : "Order received ✅",
        ar ? `طلبك ${order.id} قيد المعالجة. التوصيل خلال 10-30 دقيقة.` : `Order ${order.id} received. Delivery in 10–30 minutes.`,
        `/order/${order.id}`);
      notify("loyalty", ar ? "نقاط ولاء ⭐" : "Loyalty points ⭐",
        ar ? `ربحت ${earned} نقطة من هذا الطلب.` : `You earned ${earned} points from this order.`);
      return order;
    },
    [setOrders, setCart, setCoupon, setRecentlyPurchased, user, setUser, notify, lang]
  );

  const advanceOrder = useCallback(
    (id: string) => {
      const o = orders.find((x) => x.id === id);
      if (!o || o.status >= 4) return;
      const status = o.status + 1;
      setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      const ar = lang === "ar";
      const stage: Record<number, [string, string]> = {
        1: [ar ? "قيد التحضير 👨‍🍳" : "Preparing 👨‍🍳", ar ? `طلبك ${id} قيد التحضير الآن.` : `Your order ${id} is being prepared.`],
        2: [ar ? "جاهز 📦" : "Ready 📦", ar ? `طلبك ${id} جاهز.` : `Your order ${id} is ready.`],
        3: [ar ? "في الطريق إليك 🛵" : "Out for delivery 🛵", ar ? `طلبك ${id} في طريقه إليك.` : `Your order ${id} is on its way.`],
        4: [ar ? "تم التسليم 🏠" : "Delivered 🏠", ar ? `تم تسليم طلبك ${id}. بالهناء والشفاء!` : `Your order ${id} was delivered. Enjoy!`],
      };
      const [title, body] = stage[status];
      notify("order", title, body, `/order/${id}`);
      if (status === 4) notify("payment", ar ? "تم تأكيد الدفع ✅" : "Payment confirmed ✅", ar ? `تم تأكيد الدفع لطلبك ${id}.` : `Payment confirmed for order ${id}.`);
    },
    [orders, setOrders, notify, lang]
  );

  const openUi = useCallback((k: keyof AppState["ui"]) => { playSfx("open"); setUi((u) => ({ ...u, [k]: true })); }, []);
  const closeUi = useCallback((k: keyof AppState["ui"]) => { playSfx("close"); setUi((u) => ({ ...u, [k]: false })); }, []);

  const value = useMemo<AppState>(
    () => ({
      lang, dir, t, setLang, toggleLang,
      currency, sypRate, rateUpdatedAt, rateSource, rateHistory, exchangeAuto, syncIntervalSec,
      connectionOk, lastRateError, displayMode, setCurrency, setSypRate, updateRate, restoreRate,
      setExchangeAuto, setSyncIntervalSec, setDisplayMode, format,
      settings, setSettings, deliveryFee, storeOpen,
      cart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal,
      wishlist, toggleWishlist, favorites, toggleFavorite,
      compare, toggleCompare, clearCompare,
      recentlyViewed, addRecentlyViewed, recentlyPurchased,
      coupon, applyCoupon, useLoyalty, setUseLoyalty,
      user, login, logout, editProfile, logoutAll, savedAddresses, addAddress, removeAddress,
      notifications, toasts, notify, dismissToast, markNotifRead, markAllNotifsRead, clearNotifs,
      unreadNotifs, notifSound, setNotifSound, notifTopics, toggleNotifTopic,
      introEnabled, introDuration, introScene, introModelUrl, introSeen,
      setIntroEnabled, setIntroDuration, setIntroScene, setIntroModelUrl, markIntroSeen, replayIntro,
      promotions, activePromos, addPromo, updatePromo, removePromo, claimedPromos, claimPromo,
      themes, themeOverride, activeTheme, setThemeOverride, addTheme, updateTheme, removeTheme,
      reducedMotion, setReducedMotion,
      daypart, dayNightEnabled, daypartOverride, lightIntensity, animIntensity,
      setDayNightEnabled, setDaypartOverride, setLightIntensity, setAnimIntensity,
      orders, placeOrder, advanceOrder,
      ui, openUi, closeUi,
    }),
    [lang, dir, t, setLang, toggleLang, currency, sypRate, rateUpdatedAt, rateSource, rateHistory,
     exchangeAuto, syncIntervalSec, connectionOk, lastRateError, displayMode, setCurrency, setSypRate,
     updateRate, restoreRate, setExchangeAuto, setSyncIntervalSec, setDisplayMode, format,
     settings, setSettings, deliveryFee, storeOpen,
     cart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal,
     wishlist, toggleWishlist, favorites, toggleFavorite, compare, toggleCompare, clearCompare,
     recentlyViewed, addRecentlyViewed, recentlyPurchased, coupon, applyCoupon, useLoyalty,
     user, login, logout, editProfile, logoutAll, savedAddresses, addAddress, removeAddress,
     notifications, toasts, notify, dismissToast, markNotifRead, markAllNotifsRead, clearNotifs,
     unreadNotifs, notifSound, setNotifSound, notifTopics, toggleNotifTopic,
     introEnabled, introDuration, introScene, introModelUrl, introSeen,
     setIntroEnabled, setIntroDuration, setIntroScene, setIntroModelUrl, markIntroSeen, replayIntro,
     promotions, activePromos, addPromo, updatePromo, removePromo, claimedPromos, claimPromo,
     themes, themeOverride, activeTheme, setThemeOverride, addTheme, updateTheme, removeTheme,
     reducedMotion, setReducedMotion,
     daypart, dayNightEnabled, daypartOverride, lightIntensity, animIntensity,
     setDayNightEnabled, setDaypartOverride, setLightIntensity, setAnimIntensity,
     orders, placeOrder, advanceOrder, ui, openUi, closeUi]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}

export { DELIVERY_FEE_USD };
