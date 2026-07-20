"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Scale, User, Menu, X, Globe, ChevronDown, Bell,
} from "lucide-react";
import { useApp, type Currency } from "@/lib/stores/AppProvider";
import clsx from "clsx";

export default function Navbar() {
  const {
    t, lang, toggleLang, currency, setCurrency,
    cartCount, wishlist, compare, openUi, user, unreadNotifs,
  } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.shop },
    { href: "/#categories", label: t.nav.categories },
    { href: "/#best", label: t.nav.bestSellers },
    { href: "/#offers", label: t.nav.offers },
    { href: "/#gallery", label: t.nav.gallery },
    { href: "/#about", label: t.nav.about },
    { href: "/#contact", label: t.nav.contact },
  ];

  const IconBtn = ({
    onClick, badge, children, label,
  }: { onClick?: () => void; badge?: number; children: React.ReactNode; label: string }) => (
    <button onClick={onClick} aria-label={label} className="relative grid h-10 w-10 place-items-center rounded-full text-cream/90 transition hover:bg-white/5 hover:text-gold">
      {children}
      {badge ? (
        <span className="absolute -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink ltr:-right-0.5 rtl:-left-0.5">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "glass py-2 shadow-cinematic" : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Left: mobile menu + logo */}
          <div className="flex items-center gap-2">
            <button onClick={() => setMobile(true)} className="grid h-10 w-10 place-items-center rounded-full text-cream lg:hidden" aria-label="Menu">
              <Menu size={22} />
            </button>
            <Link href="/" className="group flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-display text-lg font-bold text-gold transition group-hover:shadow-gold-glow">N</span>
              <span className="leading-none">
                <span className="block font-display text-xl font-bold tracking-wide text-gold-gradient">{t.brand}</span>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-cream/50">{t.brandSub}</span>
              </span>
            </Link>
          </div>

          {/* Center: nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="group relative px-3 py-2 text-sm font-medium text-cream/85 transition hover:text-gold">
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5">
            {/* currency */}
            <div className="relative hidden items-center sm:flex">
              <select
                aria-label={t.common.currency}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="cursor-pointer appearance-none rounded-full bg-transparent py-1 pe-6 ps-3 text-xs font-semibold text-cream/80 outline-none hover:text-gold"
              >
                <option className="bg-ink" value="USD">USD $</option>
                <option className="bg-ink" value="SYP">SYP ل.س</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute text-cream/50 ltr:right-1 rtl:left-1" />
            </div>
            {/* language */}
            <button onClick={toggleLang} className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-cream/80 transition hover:text-gold" aria-label={t.common.language}>
              <Globe size={15} />
              {lang === "ar" ? "EN" : "ع"}
            </button>

            <IconBtn onClick={() => openUi("search")} label={t.nav.search}><Search size={19} /></IconBtn>
            <span className="hidden sm:contents"><IconBtn onClick={() => openUi("compare")} badge={compare.length} label={t.common.compare}><Scale size={19} /></IconBtn></span>
            <span className="hidden sm:contents"><IconBtn onClick={() => openUi("wishlist")} badge={wishlist.length} label={t.common.wishlist}><Heart size={19} /></IconBtn></span>
            <IconBtn onClick={() => openUi("notifs")} badge={unreadNotifs} label={lang === "ar" ? "الإشعارات" : "Notifications"}><Bell size={19} /></IconBtn>
            <IconBtn onClick={() => openUi("cart")} badge={cartCount} label={t.common.viewCart}><ShoppingBag size={19} /></IconBtn>
            <Link href="/account" aria-label={t.nav.account} className="grid h-10 w-10 place-items-center rounded-full text-cream/90 transition hover:bg-white/5 hover:text-gold">
              <User size={19} />
              {user && <span className="absolute mt-6 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer nav */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: lang === "ar" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: lang === "ar" ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="glass fixed bottom-0 top-0 z-[70] w-80 max-w-[85vw] p-6 lg:hidden ltr:left-0 rtl:right-0"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-gold-gradient">{t.brand}</span>
                <button onClick={() => setMobile(false)} className="grid h-9 w-9 place-items-center rounded-full glass-light"><X size={18} /></button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                    <Link href={l.href} onClick={() => setMobile(false)} className="block rounded-xl px-4 py-3 text-lg font-medium text-cream/90 transition hover:bg-gold/10 hover:text-gold">
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-8 flex items-center gap-3">
                <button onClick={() => { setCurrency(currency === "USD" ? "SYP" : "USD"); }} className="btn-outline-gold flex-1 py-2 text-sm">
                  {currency}
                </button>
                <button onClick={toggleLang} className="btn-outline-gold flex-1 py-2 text-sm">
                  {lang === "ar" ? "English" : "العربية"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
