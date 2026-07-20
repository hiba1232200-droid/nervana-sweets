"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Users, UserCog, LayoutTemplate,
  Megaphone, Coins, Truck, BarChart3, Bell, Settings, LogOut, Menu, X, Search,
  Volume2, VolumeX, PlusCircle, ShieldCheck, Store, Clock, Tag, Image as ImageIcon, Check,
  Activity, HardDrive, Database, Timer, Palette, Music, Sunrise,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { ADMIN_PATH } from "@/lib/admin/config";
import clsx from "clsx";

const nav = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/content", label: "Content", icon: LayoutTemplate },
  { href: "/themes", label: "Themes", icon: Palette },
  { href: "/environment", label: "Day & Night", icon: Sunrise },
  { href: "/audio", label: "Audio", icon: Music },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/promotions", label: "Promotions", icon: Timer },
  { href: "/currency", label: "Currency", icon: Coins },
  { href: "/delivery", label: "Delivery", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/system", label: "System", icon: HardDrive },
  { href: "/backups", label: "Backups", icon: Database },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout, touch, notifs, unread, soundOn, setSoundOn, markAllRead, simulateNewOrder, savedAt } = useAdmin();
  const { storeOpen } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const lastNotif = useRef(notifs[0]?.id);

  // activity → reset session timer
  useEffect(() => {
    const h = () => touch();
    window.addEventListener("click", h);
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("click", h); window.removeEventListener("keydown", h); };
  }, [touch]);

  // live new-order toast
  useEffect(() => {
    const top = notifs[0];
    if (top && top.id !== lastNotif.current && top.type === "order") {
      setToast(`${top.title} · ${top.text}`);
      const t = setTimeout(() => setToast(null), 4500);
      lastNotif.current = top.id;
      return () => clearTimeout(t);
    }
    lastNotif.current = top?.id;
  }, [notifs]);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((n) => {
        const href = ADMIN_PATH + n.href;
        const active = n.href === "" ? pathname === ADMIN_PATH : pathname === href;
        const Icon = n.icon;
        return (
          <Link key={n.href} href={href} onClick={onClick}
            className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active ? "bg-gold text-ink font-semibold" : "text-cream/70 hover:bg-white/5")}>
            <Icon size={17} /> {n.label}
            {n.label === "Notifications" && unread > 0 && (
              <span className="ms-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-white/10 bg-ink-soft p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/40 font-display text-lg font-bold text-gold">N</span>
          <div>
            <p className="font-display text-lg font-bold text-gold-gradient">NERVANA</p>
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-cream/40"><ShieldCheck size={10} /> Control Panel</p>
          </div>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto"><NavLinks /></div>
        <button onClick={logout} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10">
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 start-0 z-50 w-64 border-e border-white/10 bg-ink-soft p-4 lg:hidden">
              <div className="mb-6 flex items-center justify-between px-2">
                <span className="font-display text-lg font-bold text-gold-gradient">NERVANA Control</span>
                <button onClick={() => setOpen(false)}><X size={18} /></button>
              </div>
              <NavLinks onClick={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:ps-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-ink/80 px-4 py-3 backdrop-blur-xl">
          <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 lg:hidden"><Menu size={18} /></button>
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex">
            <Search size={15} className="text-cream/40" />
            <input placeholder="Search…" className="w-40 bg-transparent text-sm text-cream outline-none" />
          </div>
          <span className={clsx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            storeOpen ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300")}>
            <Store size={13} /> {storeOpen ? "Store Open" : "Store Closed"}
          </span>

          <span className="ms-auto hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 md:flex" title="All changes are saved automatically">
            <Check size={12} /> {savedAt ? "Saved" : "Auto-save on"}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={simulateNewOrder} className="hidden items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 sm:flex">
              <PlusCircle size={14} /> New order
            </button>
            <button onClick={() => setSoundOn(!soundOn)} className="grid h-9 w-9 place-items-center rounded-lg text-cream/60 hover:bg-white/10" title="Notification sound">
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <div className="relative">
              <button onClick={() => { setBell((b) => !b); }} className="relative grid h-9 w-9 place-items-center rounded-lg text-cream/70 hover:bg-white/10">
                <Bell size={18} />
                {unread > 0 && <span className="absolute -top-0.5 -end-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unread}</span>}
              </button>
              <AnimatePresence>
                {bell && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute end-0 mt-2 w-80 rounded-2xl border border-white/10 bg-ink-soft p-3 shadow-cinematic">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-sm font-semibold text-cream">Notifications</span>
                      <button onClick={markAllRead} className="text-xs text-gold hover:underline">Mark all read</button>
                    </div>
                    <ul className="no-scrollbar max-h-72 space-y-1 overflow-y-auto">
                      {notifs.slice(0, 8).map((n) => (
                        <li key={n.id} className={clsx("rounded-xl p-2.5 text-sm", n.read ? "bg-white/[0.02]" : "bg-gold/5")}>
                          <p className="font-medium text-cream">{n.title}</p>
                          <p className="text-xs text-cream/50">{n.text}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="ms-1 flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-xs font-bold text-ink">O</span>
              <span className="hidden text-xs text-cream/70 sm:block">Owner</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>

      {/* live toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 30, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 end-6 z-[130] flex items-center gap-3 rounded-2xl border border-gold/40 bg-ink-soft px-4 py-3 shadow-cinematic">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink"><ShoppingCart size={17} /></span>
            <div>
              <p className="text-sm font-semibold text-gold">{toast}</p>
              <p className="flex items-center gap-1 text-[11px] text-cream/50"><Clock size={10} /> Just now</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
