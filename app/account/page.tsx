"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, History, Truck, Heart, Star, Gift, Ticket,
  Bell, User, MapPin, CreditCard, RotateCcw, LogOut, Crown, Settings,
  Camera, Trash2, Plus, Save, Lock, ShieldOff, Volume2, VolumeX, Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import PushOptIn from "@/components/push/PushOptIn";

type Tab =
  | "dashboard" | "orders" | "history" | "current" | "wishlist" | "favorites"
  | "loyalty" | "coupons" | "notifications" | "profile" | "addresses" | "payments" | "recent";

export default function AccountPage() {
  const {
    t, lang, user, login, logout, orders, wishlist, favorites, format,
    recentlyPurchased, sypRate, setSypRate, currency,
  } = useApp();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-5 pt-24">
        <div className="w-full max-w-md rounded-3xl glass p-8 text-center">
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-gold/50 font-display text-2xl font-bold text-gold">N</span>
          <h1 className="font-display text-2xl font-bold text-gold-gradient">{t.account.login}</h1>
          <p className="mt-2 text-sm text-cream/50">{t.account.title}</p>
          <div className="mt-6 space-y-3">
            <button onClick={() => login({ method: "google", name: lang === "ar" ? "زائر كريم" : "Valued Guest" })} className="btn-gold w-full">{t.account.withGoogle}</button>
            <button onClick={() => login({ method: "email", name: lang === "ar" ? "زائر كريم" : "Valued Guest" })} className="btn-outline-gold w-full">{t.account.withEmail}</button>
          </div>
        </div>
      </div>
    );
  }

  const menu: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "dashboard", label: t.account.dashboard, icon: LayoutDashboard },
    { key: "orders", label: t.account.orders, icon: ShoppingBag, badge: orders.length },
    { key: "current", label: t.account.currentOrder, icon: Truck },
    { key: "history", label: t.account.history, icon: History },
    { key: "recent", label: t.account.recentlyPurchased, icon: RotateCcw },
    { key: "wishlist", label: t.account.wishlist, icon: Heart, badge: wishlist.length },
    { key: "favorites", label: t.account.favorites, icon: Star, badge: favorites.length },
    { key: "loyalty", label: t.account.loyalty, icon: Gift },
    { key: "coupons", label: t.account.coupons, icon: Ticket },
    { key: "notifications", label: t.account.notifications, icon: Bell, badge: 3 },
    { key: "profile", label: t.account.profile, icon: User },
    { key: "addresses", label: t.account.addresses, icon: MapPin },
    { key: "payments", label: t.account.payments, icon: CreditCard },
  ];

  const current = orders[0];

  return (
    <div className="min-h-screen bg-ink px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Side panel */}
          <aside className="h-fit rounded-3xl glass p-5 lg:sticky lg:top-28">
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-gold/15 to-transparent p-4">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gold font-display text-xl font-bold text-ink">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-cream">{user.name}</p>
                <p className="flex items-center gap-1 text-xs text-gold"><Crown size={12} /> {user.loyalty} {t.account.points}</p>
              </div>
            </div>
            <nav className="no-scrollbar max-h-[60vh] space-y-1 overflow-y-auto">
              {menu.map((m) => (
                <button key={m.key} onClick={() => setTab(m.key)} className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm transition ${tab === m.key ? "bg-gold text-ink" : "text-cream/70 hover:bg-white/5"}`}>
                  <span className="flex items-center gap-3"><m.icon size={17} /> {m.label}</span>
                  {m.badge ? <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${tab === m.key ? "bg-ink text-gold" : "bg-gold text-ink"}`}>{m.badge}</span> : null}
                </button>
              ))}
              <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10">
                <LogOut size={17} /> {t.account.logout}
              </button>
            </nav>
          </aside>

          {/* Content */}
          <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {tab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat icon={ShoppingBag} label={t.account.orders} value={String(orders.length)} />
                  <Stat icon={Gift} label={t.account.loyalty} value={`${user.loyalty}`} />
                  <Stat icon={Heart} label={t.account.wishlist} value={String(wishlist.length)} />
                </div>
                <Panel title={t.account.currentOrder}>
                  {current ? <OrderRow order={current} format={format} lang={lang} t={t} /> : <Empty t={t} />}
                </Panel>
                {/* Admin: currency exchange rate */}
                <Panel title={`${t.common.currency} — SYP (${lang === "ar" ? "لوحة التحكم" : "Admin"})`}>
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-gold" />
                    <span className="text-sm text-cream/70">1 USD =</span>
                    <input type="number" value={sypRate} onChange={(e) => setSypRate(Math.max(1, +e.target.value))} className="w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-cream outline-none focus:border-gold" />
                    <span className="text-sm text-cream/70">SYP</span>
                    <span className="text-xs text-cream/40">({lang === "ar" ? "يُحسب تلقائياً في المتجر" : "auto-applied storewide"}, {currency})</span>
                  </div>
                </Panel>
              </div>
            )}

            {tab === "orders" && (
              <Panel title={t.account.orders}>
                {orders.length ? orders.map((o) => <OrderRow key={o.id} order={o} format={format} lang={lang} t={t} />) : <Empty t={t} />}
              </Panel>
            )}

            {tab === "current" && (
              <Panel title={t.account.currentOrder}>
                {current ? (
                  <div>
                    <OrderRow order={current} format={format} lang={lang} t={t} />
                    <Link href={`/order/${current.id}`} className="btn-gold mt-4">{t.order.tracking}</Link>
                  </div>
                ) : <Empty t={t} />}
              </Panel>
            )}

            {tab === "history" && (
              <Panel title={t.account.history}>
                {orders.length ? orders.map((o) => <OrderRow key={o.id} order={o} format={format} lang={lang} t={t} />) : <Empty t={t} />}
              </Panel>
            )}

            {(tab === "wishlist" || tab === "favorites" || tab === "recent") && (
              <Panel title={tab === "wishlist" ? t.account.wishlist : tab === "favorites" ? t.account.favorites : t.account.recentlyPurchased}>
                <ProductMini ids={tab === "wishlist" ? wishlist : tab === "favorites" ? favorites : recentlyPurchased} lang={lang} format={format} t={t} />
              </Panel>
            )}

            {tab === "loyalty" && (
              <Panel title={t.account.loyalty}>
                <div className="rounded-2xl bg-gradient-to-br from-gold/20 to-transparent p-8 text-center">
                  <Crown className="mx-auto text-gold" size={40} />
                  <div className="mt-3 font-display text-5xl font-bold text-gold-gradient">{user.loyalty}</div>
                  <p className="mt-1 text-cream/60">{t.account.points}</p>
                  <p className="mx-auto mt-4 max-w-sm text-sm text-cream/50">{lang === "ar" ? "كل دولار تنفقه = 1 نقطة. استبدل نقاطك عند الدفع للحصول على خصومات." : "Every $1 spent = 1 point. Redeem points at checkout for discounts."}</p>
                </div>
              </Panel>
            )}

            {tab === "coupons" && (
              <Panel title={t.account.coupons}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[["NERVANA10", 10], ["GOLD20", 20], ["WELCOME15", 15]].map(([code, pct]) => (
                    <div key={code as string} className="flex items-center justify-between rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-4">
                      <div>
                        <p className="font-display text-lg font-bold text-gold">{code}</p>
                        <p className="text-xs text-cream/50">{lang === "ar" ? `خصم ${pct}%` : `${pct}% off`}</p>
                      </div>
                      <Ticket className="text-gold" />
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "notifications" && <NotificationSettings />}

            {tab === "profile" && <ProfilePanel />}

            {tab === "addresses" && <AddressesPanel />}

            {tab === "payments" && (
              <Panel title={t.account.payments}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-gradient-to-br from-ink-soft to-ink p-5 shadow-cinematic">
                    <div className="flex justify-between"><CreditCard className="text-gold" /><span className="text-xs text-cream/50">VISA</span></div>
                    <p className="mt-6 font-mono tracking-widest text-cream">•••• •••• •••• 4242</p>
                    <p className="mt-2 text-xs text-cream/50">{user.name}</p>
                  </div>
                  <div className="grid place-items-center rounded-2xl border border-dashed border-white/20 p-5 text-sm text-cream/50">+ {lang === "ar" ? "إضافة بطاقة" : "Add card"}</div>
                </div>
              </Panel>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-5">
      <Icon className="text-gold" size={22} />
      <div className="mt-3 font-display text-3xl font-bold text-cream">{value}</div>
      <div className="text-xs text-cream/50">{label}</div>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl glass p-6">
      <h2 className="mb-4 font-display text-xl font-bold text-gold-gradient">{title}</h2>
      {children}
    </div>
  );
}
function Empty({ t }: { t: any }) {
  return <p className="py-8 text-center text-sm text-cream/40">{t.cart.emptyDesc}</p>;
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wider text-gold/70">{label}</p>
      <p className="mt-1 text-cream">{value}</p>
    </div>
  );
}
function OrderRow({ order, format, lang, t }: any) {
  const statusLabels = [t.order.pending, t.order.preparing, t.order.ready, t.order.outForDelivery, t.order.delivered];
  return (
    <Link href={`/order/${order.id}`} className="mb-3 flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
      <div>
        <p className="font-semibold text-cream">{order.id}</p>
        <p className="text-xs text-cream/50">{new Date(order.date).toLocaleString(lang === "ar" ? "ar-SY" : "en-US")} · {order.items.length} {t.filters.results}</p>
      </div>
      <div className="text-end">
        <p className="font-bold text-gold">{format(order.total)}</p>
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-gold">{statusLabels[order.status]}</span>
      </div>
    </Link>
  );
}
function ProductMini({ ids, lang, format, t }: any) {
  const items = ids.map(getProduct).filter(Boolean);
  if (!items.length) return <Empty t={t} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p: any) => (
        <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl"><Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cream">{lang === "ar" ? p.name : p.nameEn}</p>
            <p className="text-sm font-bold text-gold">{format(discountedPrice(p))}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cream outline-none focus:border-gold";

function ProfilePanel() {
  const { t, lang, user, editProfile, logoutAll } = useApp();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwDone, setPwDone] = useState(false);

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => editProfile({ avatar: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Panel title={t.account.profile}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative">
            {user?.avatar ? (
              <Image src={user.avatar} alt="avatar" width={88} height={88} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gold font-display text-3xl font-bold text-ink">{user?.name.charAt(0)}</div>
            )}
            <label className="absolute -bottom-1 -end-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-gold text-ink shadow-gold-glow">
              <Camera size={15} />
              <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <span className="mb-1 block text-xs text-cream/50">{t.checkout.fullName}</span>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-cream/50">{t.checkout.phone}</span>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <span className="mb-1 block text-xs text-cream/50">Email</span>
                <input disabled className={inputCls + " opacity-60"} value={user?.email || ""} />
              </div>
            </div>
            <button onClick={() => { editProfile(form); setSaved(true); setTimeout(() => setSaved(false), 1500); }} className="btn-gold px-5 py-2 text-sm">
              <Save size={15} /> {saved ? "✓" : lang === "ar" ? "حفظ" : "Save changes"}
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Lock size={14} className="absolute start-3 top-3.5 text-gold/70" />
            <input type="password" placeholder={lang === "ar" ? "كلمة المرور الحالية" : "Current password"} className={inputCls + " ps-9"} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute start-3 top-3.5 text-gold/70" />
            <input type="password" placeholder={lang === "ar" ? "كلمة المرور الجديدة" : "New password"} className={inputCls + " ps-9"} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </div>
        </div>
        <button onClick={() => { if (pw.current && pw.next) { setPwDone(true); setPw({ current: "", next: "" }); setTimeout(() => setPwDone(false), 1800); } }} className="btn-outline-gold mt-3 px-5 py-2 text-sm">
          {pwDone ? (lang === "ar" ? "✓ تم التحديث" : "✓ Updated") : lang === "ar" ? "تحديث كلمة المرور" : "Update password"}
        </button>
      </Panel>

      <Panel title={lang === "ar" ? "الأمان" : "Security"}>
        <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-cream"><ShieldOff size={15} className="text-rose-400" /> {lang === "ar" ? "تسجيل الخروج من جميع الأجهزة" : "Log out from all devices"}</p>
            <p className="mt-1 text-xs text-cream/50">{lang === "ar" ? "ينهي جميع الجلسات النشطة على كل الأجهزة." : "Ends every active session on all your devices."}</p>
          </div>
          <button onClick={logoutAll} className="rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">
            {lang === "ar" ? "خروج" : "Sign out"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function AddressesPanel() {
  const { t, lang, savedAddresses, addAddress, removeAddress } = useApp();
  const [adding, setAdding] = useState(false);
  const [a, setA] = useState({ label: "", fullName: "", phone: "", city: "", street: "", building: "" });

  return (
    <Panel title={t.account.addresses}>
      <div className="grid gap-3 sm:grid-cols-2">
        {savedAddresses.map((addr) => (
          <div key={addr.id} className="relative rounded-2xl bg-white/[0.03] p-4">
            <button onClick={() => removeAddress(addr.id)} className="absolute end-3 top-3 text-white/40 hover:text-rose-400"><Trash2 size={15} /></button>
            <p className="flex items-center gap-2 font-semibold text-cream"><MapPin size={15} className="text-gold" /> {addr.label}</p>
            <p className="mt-1 text-sm text-cream/70">{addr.fullName} · {addr.phone}</p>
            <p className="text-sm text-cream/50">{addr.city}, {addr.street} {addr.building}</p>
          </div>
        ))}
        <button onClick={() => setAdding((v) => !v)} className="grid min-h-[96px] place-items-center rounded-2xl border border-dashed border-white/20 text-sm text-cream/50 transition hover:border-gold hover:text-gold">
          <span className="flex items-center gap-2"><Plus size={16} /> {lang === "ar" ? "إضافة عنوان" : "Add address"}</span>
        </button>
      </div>

      {adding && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-white/[0.02] p-4 sm:grid-cols-2">
          <input placeholder={lang === "ar" ? "التسمية (المنزل/العمل)" : "Label (Home/Work)"} className={inputCls} value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} />
          <input placeholder={t.checkout.fullName} className={inputCls} value={a.fullName} onChange={(e) => setA({ ...a, fullName: e.target.value })} />
          <input placeholder={t.checkout.phone} className={inputCls} value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} />
          <input placeholder={lang === "ar" ? "المدينة" : "City"} className={inputCls} value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} />
          <input placeholder={t.checkout.street} className={inputCls} value={a.street} onChange={(e) => setA({ ...a, street: e.target.value })} />
          <input placeholder={t.checkout.building} className={inputCls} value={a.building} onChange={(e) => setA({ ...a, building: e.target.value })} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="rounded-lg px-4 py-2 text-sm text-cream/60 hover:bg-white/5">{lang === "ar" ? "إلغاء" : "Cancel"}</button>
            <button
              onClick={() => { if (a.label && a.fullName) { addAddress(a); setA({ label: "", fullName: "", phone: "", city: "", street: "", building: "" }); setAdding(false); } }}
              className="btn-gold px-5 py-2 text-sm"
            >{lang === "ar" ? "حفظ العنوان" : "Save address"}</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

const NOTIF_TOPICS = [
  { key: "orders", ar: "تحديثات الطلب والدفع", en: "Order & payment updates" },
  { key: "discounts", ar: "الخصومات والعروض الخاطفة", en: "Discounts & flash sales" },
  { key: "products", ar: "المنتجات الجديدة", en: "New products" },
  { key: "offers", ar: "العروض الموسمية والولاء", en: "Seasonal offers & loyalty" },
];

function NotificationSettings() {
  const { t, lang, notifTopics, toggleNotifTopic, notifSound, setNotifSound, notify, notifications, openUi } = useApp();

  const tests = [
    { kind: "flash" as const, ar: ["⚡ عرض خاطف", "خصم 30٪ لمدة ساعة على البقلاوة الملكية!"], en: ["⚡ Flash Sale", "30% off Royal Baklava for one hour!"] },
    { kind: "restock" as const, ar: ["🔔 عاد للتوفّر", "منتجك المفضّل متوفّر الآن مجدداً."], en: ["🔔 Back in Stock", "Your favorite product is available again."] },
    { kind: "coupon" as const, ar: ["🎟️ تذكير كوبون", "كوبون GOLD20 ينتهي غداً!"], en: ["🎟️ Coupon Reminder", "Coupon GOLD20 expires tomorrow!"] },
    { kind: "birthday" as const, ar: ["🎂 هدية عيد ميلادك", "خصم خاص 25٪ بمناسبة عيد ميلادك!"], en: ["🎂 Birthday Gift", "A special 25% off for your birthday!"] },
    { kind: "seasonal" as const, ar: ["🎁 مجموعة الموسم", "مجموعة رمضان الفاخرة وصلت الآن."], en: ["🎁 Seasonal Collection", "Our luxury Ramadan collection just dropped."] },
  ];

  return (
    <div className="space-y-4">
      <Panel title={lang === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}>
        <div className="mb-4"><PushOptIn lang={lang} /></div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/[0.03] p-4">
          <span className="flex items-center gap-2 text-sm text-cream/80">
            {notifSound ? <Volume2 size={16} className="text-gold" /> : <VolumeX size={16} className="text-cream/50" />}
            {lang === "ar" ? "أصوات الإشعارات" : "Notification sounds"}
          </span>
          <button onClick={() => setNotifSound(!notifSound)} className={`relative h-6 w-11 rounded-full transition ${notifSound ? "bg-gold" : "bg-white/15"}`} role="switch" aria-checked={notifSound}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notifSound ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        <p className="mb-2 text-xs uppercase tracking-wider text-gold/70">{lang === "ar" ? "أنواع الإشعارات" : "What to notify me about"}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {NOTIF_TOPICS.map((tp) => {
            const on = notifTopics.includes(tp.key);
            return (
              <button key={tp.key} onClick={() => toggleNotifTopic(tp.key)} className={`flex items-center justify-between rounded-2xl border p-3 text-start text-sm transition ${on ? "border-gold/40 bg-gold/5 text-cream" : "border-white/10 bg-white/[0.02] text-cream/50"}`}>
                {lang === "ar" ? tp.ar : tp.en}
                <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-gold" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title={lang === "ar" ? "جرّب الإشعارات" : "Try Notifications"}>
        <p className="mb-3 text-xs text-cream/50">{lang === "ar" ? "اضغط لإرسال إشعار تجريبي داخل الموقع." : "Tap to send a sample in-app notification."}</p>
        <div className="flex flex-wrap gap-2">
          {tests.map((x) => (
            <button key={x.kind} onClick={() => notify(x.kind, (lang === "ar" ? x.ar : x.en)[0], (lang === "ar" ? x.ar : x.en)[1])}
              className="flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-cream/80 transition hover:border-gold hover:text-gold">
              <Sparkles size={12} /> {(lang === "ar" ? x.ar : x.en)[0]}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={t.account.notifications}>
        <button onClick={() => openUi("notifs")} className="mb-3 text-sm text-gold hover:underline">{lang === "ar" ? "فتح مركز الإشعارات ←" : "Open notification center →"}</button>
        <ul className="space-y-2">
          {notifications.slice(0, 6).map((n) => (
            <li key={n.id} className={`flex items-start gap-3 rounded-2xl p-3 ${n.read ? "bg-white/[0.02]" : "bg-gold/5"}`}>
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-gold/10 text-gold"><Bell size={14} /></span>
              <div className="flex-1">
                <p className="text-sm font-medium text-cream">{n.title}</p>
                <p className="text-xs text-cream/50">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-cream/35">{new Date(n.at).toLocaleString(lang === "ar" ? "ar-SY" : "en-US")}</p>
              </div>
            </li>
          ))}
          {notifications.length === 0 && <Empty t={t} />}
        </ul>
      </Panel>
    </div>
  );
}
