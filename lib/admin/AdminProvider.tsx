"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { Order } from "@/lib/stores/AppProvider";
import { ADMIN_DEMO, SESSION_TIMEOUT } from "./config";
import {
  seedProducts, seedCustomers, seedOrders, seedEmployees, seedCoupons, seedBanners,
  seedReviews, seedNotifs, seedInventoryLog, seedLoginHistory, seedMedia, REF_NOW,
  type AdminProduct, type Employee, type Customer, type Coupon, type Banner,
  type ReviewMod, type Notif, type NotifType, type LoginRecord, type InventoryLog,
  type MediaItem, type MediaFolderKey,
} from "./seed";

type Phase = "login" | "2fa" | "authed";

function usePersisted<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setState(JSON.parse(raw)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState] as const;
}

export interface AdminStats {
  revTotal: number; revDay: number; revWeek: number; revMonth: number; revYear: number;
  ordersTotal: number; ordersToday: number; ordersActive: number; ordersDelivered: number; ordersCancelled: number;
  productsTotal: number; outOfStock: number; lowStock: number;
  usersTotal: number; usersActive: number; usersOnline: number; visitors: number;
  conversion: number; aov: number;
  bestSellers: { id: string; name: string; qty: number; revenue: number }[];
  topCustomers: { name: string; spending: number; orders: number }[];
  mostViewed: { name: string; views: number }[];
  monthly: { label: string; value: number }[];
  weekly: { label: string; value: number }[];
}

interface AdminState {
  phase: Phase;
  authed: boolean;
  loginError: string;
  attempts: LoginRecord[];
  loginHistory: LoginRecord[];
  tryLogin: (u: string, p: string) => void;
  verify2FA: (code: string) => boolean;
  logout: () => void;
  touch: () => void;
  lastActive: number;

  products: AdminProduct[];
  addProduct: (p: Partial<AdminProduct>) => void;
  updateProduct: (id: string, p: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  bulkUpdate: (ids: string[], patch: Partial<AdminProduct>) => void;
  adjustStock: (id: string, delta: number, reason: string) => void;

  // pricing management
  setPrice: (id: string, price: number) => void;
  bulkPrice: (ids: string[], mode: "set" | "increase" | "decrease", value: number) => void;
  applyDiscount: (id: string, percent: number) => void;
  scheduleDiscount: (ids: string[], percent: number, start: string, end: string) => void;
  restorePrice: (id: string) => void;

  // media library
  media: MediaItem[];
  addMedia: (items: Omit<MediaItem, "id" | "createdAt">[]) => void;
  renameMedia: (id: string, filename: string) => void;
  setMediaAlt: (id: string, alt: string) => void;
  moveMedia: (id: string, folder: MediaFolderKey) => void;
  replaceMedia: (id: string, url: string) => void;
  removeMedia: (id: string) => void;
  inventoryLog: InventoryLog[];
  disableAtZero: boolean;
  setDisableAtZero: (v: boolean) => void;

  orders: Order[];
  importOrders: (list: Order[]) => void;
  setOrderStatus: (id: string, status: number) => void;
  cancelOrder: (id: string) => void;
  refundOrder: (id: string) => void;
  assignDriver: (id: string, driver: string) => void;
  simulateNewOrder: () => void;

  customers: Customer[];
  banCustomer: (id: string) => void;
  deleteCustomer: (id: string) => void;

  employees: Employee[];
  addEmployee: (e: Partial<Employee>) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;

  banners: Banner[];
  toggleBanner: (id: string) => void;
  reviews: ReviewMod[];
  setReviewStatus: (id: string, s: ReviewMod["status"]) => void;

  // autosave
  savedAt: number;
  editHistory: { at: number; label: string }[];

  notifs: Notif[];
  unread: number;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  markAllRead: () => void;
  pushNotif: (type: NotifType, title: string, text: string) => void;

  stats: AdminStats;
}

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // ---- auth ----
  const [phase, setPhase] = usePersisted<Phase>("adm_phase", "login");
  const [loginError, setLoginError] = useState("");
  const [attempts, setAttempts] = usePersisted<LoginRecord[]>("adm_attempts", []);
  const [loginHistory, setLoginHistory] = usePersisted<LoginRecord[]>("adm_history", seedLoginHistory());
  const [lastActive, setLastActive] = usePersisted<number>("adm_active", REF_NOW);

  const record = (success: boolean): LoginRecord => ({
    id: "L-" + Math.random().toString(36).slice(2, 7),
    device: typeof navigator !== "undefined" ? `${navigator.platform || "Device"} · Browser` : "Device",
    ip: "—", location: "Current session", date: new Date().toISOString(), success,
  });

  const tryLogin = useCallback((u: string, p: string) => {
    if (u === ADMIN_DEMO.username && p === ADMIN_DEMO.password) {
      setLoginError("");
      setAttempts((a) => [record(true), ...a].slice(0, 20));
      setPhase("2fa");
    } else {
      setLoginError("wrong");
      setAttempts((a) => [record(false), ...a].slice(0, 20));
    }
  }, [setAttempts, setPhase]);

  const verify2FA = useCallback((code: string) => {
    if (/^\d{6}$/.test(code)) {
      setPhase("authed");
      setLastActive(Date.now());
      setLoginHistory((h) => [record(true), ...h].slice(0, 30));
      return true;
    }
    return false;
  }, [setPhase, setLastActive, setLoginHistory]);

  const logout = useCallback(() => { setPhase("login"); }, [setPhase]);
  const touch = useCallback(() => setLastActive(Date.now()), [setLastActive]);

  // session timeout
  useEffect(() => {
    if (phase !== "authed") return;
    const i = setInterval(() => {
      if (Date.now() - lastActive > SESSION_TIMEOUT) setPhase("login");
    }, 15000);
    return () => clearInterval(i);
  }, [phase, lastActive, setPhase]);

  // ---- data ----
  const [products, setProducts] = usePersisted<AdminProduct[]>("adm_products", seedProducts());
  const [orders, setOrders] = usePersisted<Order[]>("adm_orders", seedOrders());
  const [customers, setCustomers] = usePersisted<Customer[]>("adm_customers", seedCustomers());
  const [employees, setEmployees] = usePersisted<Employee[]>("adm_employees", seedEmployees());
  const [coupons, setCoupons] = usePersisted<Coupon[]>("adm_coupons", seedCoupons());
  const [banners, setBanners] = usePersisted<Banner[]>("adm_banners", seedBanners());
  const [reviews, setReviews] = usePersisted<ReviewMod[]>("adm_reviews", seedReviews());
  const [notifs, setNotifs] = usePersisted<Notif[]>("adm_notifs", seedNotifs());
  const [inventoryLog, setInventoryLog] = usePersisted<InventoryLog[]>("adm_invlog", seedInventoryLog());
  const [disableAtZero, setDisableAtZero] = usePersisted<boolean>("adm_disable_zero", true);
  const [soundOn, setSoundOn] = usePersisted<boolean>("adm_sound", true);
  const [media, setMedia] = usePersisted<MediaItem[]>("adm_media", seedMedia());

  // ---- products CRUD ----
  const addProduct = useCallback((p: Partial<AdminProduct>) => {
    const base = seedProducts()[0];
    const id = "p" + Date.now();
    setProducts((prev) => [{ ...base, ...p, id, slug: id, reviews: [] } as AdminProduct, ...prev]);
  }, [setProducts]);
  const updateProduct = useCallback((id: string, p: Partial<AdminProduct>) =>
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), [setProducts]);
  const deleteProduct = useCallback((id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id)), [setProducts]);
  const duplicateProduct = useCallback((id: string) =>
    setProducts((prev) => {
      const p = prev.find((x) => x.id === id); if (!p) return prev;
      const nid = "p" + Date.now();
      return [{ ...p, id: nid, slug: nid, nameEn: p.nameEn + " (Copy)", name: p.name + " (نسخة)" }, ...prev];
    }), [setProducts]);
  const bulkUpdate = useCallback((ids: string[], patch: Partial<AdminProduct>) =>
    setProducts((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, ...patch } : x))), [setProducts]);

  const adjustStock = useCallback((id: string, delta: number, reason: string) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x)));
    setInventoryLog((prev) => [{
      id: "INV-" + Math.random().toString(36).slice(2, 6),
      product: products.find((p) => p.id === id)?.nameEn || id,
      change: delta, reason, date: new Date().toISOString(),
    }, ...prev].slice(0, 60));
  }, [setProducts, setInventoryLog, products]);

  // ---- pricing management ----
  const setPrice = useCallback((id: string, price: number) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price: Math.max(0, price) } : p))), [setProducts]);

  const bulkPrice = useCallback((ids: string[], mode: "set" | "increase" | "decrease", value: number) =>
    setProducts((prev) => prev.map((p) => {
      if (!ids.includes(p.id)) return p;
      let price = p.price;
      if (mode === "set") price = value;
      else if (mode === "increase") price = p.price * (1 + value / 100);
      else price = p.price * (1 - value / 100);
      return { ...p, price: Math.round(Math.max(0, price) * 100) / 100 };
    })), [setProducts]);

  const applyDiscount = useCallback((id: string, percent: number) =>
    setProducts((prev) => prev.map((p) => (p.id === id
      ? { ...p, originalPrice: p.originalPrice ?? p.price, discount: Math.min(90, Math.max(0, percent)), badges: percent > 0 && !p.badges.includes("discount") ? [...p.badges, "discount"] : p.badges }
      : p))), [setProducts]);

  const scheduleDiscount = useCallback((ids: string[], percent: number, start: string, end: string) =>
    setProducts((prev) => prev.map((p) => (ids.includes(p.id)
      ? { ...p, originalPrice: p.originalPrice ?? p.price, discount: percent, discountStart: start, discountEnd: end }
      : p))), [setProducts]);

  const restorePrice = useCallback((id: string) =>
    setProducts((prev) => prev.map((p) => (p.id === id
      ? { ...p, price: p.originalPrice ?? p.price, originalPrice: undefined, discount: 0, discountStart: undefined, discountEnd: undefined, badges: p.badges.filter((b) => b !== "discount") }
      : p))), [setProducts]);

  // ---- media library ----
  const addMedia = useCallback((items: Omit<MediaItem, "id" | "createdAt">[]) =>
    setMedia((prev) => [
      ...items.map((it, i) => ({ ...it, id: "M-" + Math.random().toString(36).slice(2, 7) + i, createdAt: new Date().toISOString() })),
      ...prev,
    ]), [setMedia]);
  const renameMedia = useCallback((id: string, filename: string) =>
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, filename } : m))), [setMedia]);
  const setMediaAlt = useCallback((id: string, alt: string) =>
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, alt } : m))), [setMedia]);
  const moveMedia = useCallback((id: string, folder: MediaFolderKey) =>
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, folder } : m))), [setMedia]);
  const replaceMedia = useCallback((id: string, url: string) =>
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, url } : m))), [setMedia]);
  const removeMedia = useCallback((id: string) =>
    setMedia((prev) => prev.filter((m) => m.id !== id)), [setMedia]);

  // ---- orders ----
  const importOrders = useCallback((list: Order[]) => {
    setOrders((prev) => {
      const ids = new Set(prev.map((o) => o.id));
      const incoming = list.filter((o) => !ids.has(o.id));
      return incoming.length ? [...incoming, ...prev] : prev;
    });
  }, [setOrders]);
  const setOrderStatus = useCallback((id: string, status: number) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, paymentStatus: status === 4 ? "paid" : o.paymentStatus } : o))), [setOrders]);
  const cancelOrder = useCallback((id: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state: "cancelled" } : o))), [setOrders]);
  const refundOrder = useCallback((id: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state: "refunded", paymentStatus: "refunded" } : o))), [setOrders]);
  const assignDriver = useCallback((id: string, driver: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, driver } : o))), [setOrders]);

  const pushNotif = useCallback((type: NotifType, title: string, text: string) => {
    setNotifs((prev) => [{ id: "N-" + Math.random().toString(36).slice(2, 7), type, title, text, date: new Date().toISOString(), read: false }, ...prev].slice(0, 60));
  }, [setNotifs]);

  const soundRef = useRef(soundOn);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  const beep = useCallback(() => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AC();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start(); o.stop(ctx.currentTime + 0.42);
    } catch {}
  }, []);

  const simulateNewOrder = useCallback(() => {
    const demo = seedOrders()[Math.floor(Math.random() * 40)];
    const id = "NV-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const o: Order = { ...demo, id, date: new Date().toISOString(), status: 0, state: "active" };
    setOrders((prev) => [o, ...prev]);
    pushNotif("order", "طلب جديد — New Order", `${id} · $${o.total.toFixed(2)}`);
    beep();
  }, [setOrders, pushNotif, beep]);

  // ---- customers ----
  const banCustomer = useCallback((id: string) =>
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, banned: !c.banned } : c))), [setCustomers]);
  const deleteCustomer = useCallback((id: string) =>
    setCustomers((prev) => prev.filter((c) => c.id !== id)), [setCustomers]);

  // ---- employees ----
  const addEmployee = useCallback((e: Partial<Employee>) =>
    setEmployees((prev) => [{ id: "E-" + Date.now(), name: "", email: "", phone: "", role: "driver", permissions: [], active: true, ...e } as Employee, ...prev]), [setEmployees]);
  const updateEmployee = useCallback((id: string, e: Partial<Employee>) =>
    setEmployees((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x))), [setEmployees]);
  const deleteEmployee = useCallback((id: string) =>
    setEmployees((prev) => prev.filter((x) => x.id !== id)), [setEmployees]);

  // ---- coupons ----
  const addCoupon = useCallback((c: Coupon) => setCoupons((prev) => [c, ...prev.filter((x) => x.code !== c.code)]), [setCoupons]);
  const toggleCoupon = useCallback((code: string) => setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))), [setCoupons]);
  const deleteCoupon = useCallback((code: string) => setCoupons((prev) => prev.filter((c) => c.code !== code)), [setCoupons]);

  // ---- content ----
  const toggleBanner = useCallback((id: string) => setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))), [setBanners]);
  const setReviewStatus = useCallback((id: string, s: ReviewMod["status"]) => setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: s } : r))), [setReviews]);

  const markAllRead = useCallback(() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))), [setNotifs]);
  const unread = notifs.filter((n) => !n.read).length;

  // ---- autosave: every change is persisted to localStorage (recovered on refresh) ----
  const [savedAt, setSavedAt] = useState(0);
  const [editHistory, setEditHistory] = useState<{ at: number; label: string }[]>([]);
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const at = Date.now();
    setSavedAt(at);
    setEditHistory((h) => [{ at, label: "Changes auto-saved" }, ...h].slice(0, 40));
  }, [products, orders, coupons, employees, banners, reviews, media, inventoryLog]);

  // ---- analytics ----
  const stats = useMemo<AdminStats>(() => {
    const now = Date.now();
    const DAY = 86400000;
    const valid = orders.filter((o) => o.state !== "cancelled");
    const rev = (since: number) => valid.filter((o) => now - new Date(o.date).getTime() <= since).reduce((s, o) => s + o.total, 0);
    const revTotal = valid.reduce((s, o) => s + o.total, 0);

    const bestMap = new Map<string, { id: string; name: string; qty: number; revenue: number }>();
    valid.forEach((o) => o.items.forEach((it) => {
      const e = bestMap.get(it.id) || { id: it.id, name: it.nameEn, qty: 0, revenue: 0 };
      e.qty += it.qty; e.revenue += it.price * it.qty; bestMap.set(it.id, e);
    }));
    const bestSellers = [...bestMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);

    const topCustomers = [...customers].sort((a, b) => b.spending - a.spending).slice(0, 6)
      .map((c) => ({ name: c.name, spending: c.spending, orders: c.orders }));

    const mostViewed = [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 6)
      .map((p) => ({ name: p.nameEn, views: p.ratingCount * 37 }));

    // 12-month revenue series
    const monthly = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now); d.setMonth(d.getMonth() - (11 - i));
      const m = d.getMonth(), y = d.getFullYear();
      const value = valid.filter((o) => { const od = new Date(o.date); return od.getMonth() === m && od.getFullYear() === y; }).reduce((s, o) => s + o.total, 0);
      return { label: d.toLocaleDateString("en-US", { month: "short" }), value: Math.round(value) };
    });
    // 7-day revenue series
    const weekly = Array.from({ length: 7 }).map((_, i) => {
      const start = now - (6 - i) * DAY;
      const value = valid.filter((o) => { const t = new Date(o.date).getTime(); return t >= start - DAY && t < start; }).reduce((s, o) => s + o.total, 0);
      return { label: new Date(start).toLocaleDateString("en-US", { weekday: "short" }), value: Math.round(value) };
    });

    const ordersTotal = orders.length;
    const ordersDelivered = valid.filter((o) => o.status === 4).length;
    return {
      revTotal: Math.round(revTotal),
      revDay: Math.round(rev(DAY)), revWeek: Math.round(rev(7 * DAY)), revMonth: Math.round(rev(30 * DAY)), revYear: Math.round(rev(365 * DAY)),
      ordersTotal,
      ordersToday: valid.filter((o) => now - new Date(o.date).getTime() <= DAY).length,
      ordersActive: valid.filter((o) => o.status < 4).length,
      ordersDelivered,
      ordersCancelled: orders.filter((o) => o.state === "cancelled").length,
      productsTotal: products.length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      usersTotal: customers.length + 25000,
      usersActive: customers.filter((c) => !c.banned).length + 1840,
      usersOnline: 63,
      visitors: 12480,
      conversion: ordersTotal ? Math.round((ordersTotal / 12480) * 1000) / 10 : 0,
      aov: valid.length ? Math.round((revTotal / valid.length) * 100) / 100 : 0,
      bestSellers, topCustomers, mostViewed, monthly, weekly,
    };
  }, [orders, customers, products]);

  const value: AdminState = {
    phase, authed: phase === "authed", loginError, attempts, loginHistory,
    tryLogin, verify2FA, logout, touch, lastActive,
    products, addProduct, updateProduct, deleteProduct, duplicateProduct, bulkUpdate, adjustStock,
    setPrice, bulkPrice, applyDiscount, scheduleDiscount, restorePrice,
    media, addMedia, renameMedia, setMediaAlt, moveMedia, replaceMedia, removeMedia,
    inventoryLog, disableAtZero, setDisableAtZero,
    orders, importOrders, setOrderStatus, cancelOrder, refundOrder, assignDriver, simulateNewOrder,
    customers, banCustomer, deleteCustomer,
    employees, addEmployee, updateEmployee, deleteEmployee,
    coupons, addCoupon, toggleCoupon, deleteCoupon,
    banners, toggleBanner, reviews, setReviewStatus,
    savedAt, editHistory,
    notifs, unread, soundOn, setSoundOn, markAllRead, pushNotif,
    stats,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used within AdminProvider");
  return c;
}
