"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Sparkles, TrendingUp } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { products, discountedPrice } from "@/lib/data/products";

// Lightweight "AI-powered" smart search: token scoring + intent suggestions
function smartScore(q: string, hay: string) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const h = hay.toLowerCase();
  return tokens.reduce((s, tk) => (h.includes(tk) ? s + (h.startsWith(tk) ? 3 : 1) : s), 0);
}

export default function SearchModal() {
  const { t, lang, ui, closeUi, format } = useApp();
  const [q, setQ] = useState("");

  const suggestions = lang === "ar"
    ? ["بقلاوة فستق", "علبة إهداء", "كنافة", "خصومات", "الأكثر مبيعاً"]
    : ["pistachio baklava", "gift box", "kunafa", "discounts", "best sellers"];

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return products
      .map((p) => ({
        p,
        score: smartScore(q, `${p.name} ${p.nameEn} ${p.category} ${p.desc} ${p.descEn}`),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [q]);

  const trending = products.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <AnimatePresence>
      {ui.search && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-24"
          onClick={() => closeUi("search")}
        >
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-2xl overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 p-5">
              <Sparkles className="text-gold" size={20} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.nav.search}
                className="flex-1 bg-transparent text-lg text-cream outline-none placeholder:text-white/40"
              />
              <button onClick={() => closeUi("search")} className="grid h-9 w-9 place-items-center rounded-full glass-light"><X size={16} /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {!q.trim() ? (
                <>
                  <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-gold/70">
                    <Sparkles size={13} /> {t.common.recommended}
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => setQ(s)} className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-cream/80 transition hover:border-gold hover:text-gold">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-gold/70">
                    <TrendingUp size={13} /> {t.sections.bestSellers}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {trending.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`} onClick={() => closeUi("search")} className="group">
                        <div className="relative aspect-square overflow-hidden rounded-xl">
                          <Image src={p.images[0]} alt="" fill className="object-cover transition group-hover:scale-110" sizes="120px" />
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-cream/80">{lang === "ar" ? p.name : p.nameEn}</p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : results.length === 0 ? (
                <p className="py-12 text-center text-white/50">—</p>
              ) : (
                <ul className="space-y-2">
                  {results.map(({ p }) => (
                    <li key={p.id}>
                      <Link href={`/products/${p.id}`} onClick={() => closeUi("search")} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/5">
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                          <Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-cream">{lang === "ar" ? p.name : p.nameEn}</p>
                          <p className="text-xs text-white/50">{p.weight}</p>
                        </div>
                        <span className="text-sm font-bold text-gold">{format(discountedPrice(p))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
