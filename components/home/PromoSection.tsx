"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Gift, Check } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import Countdown from "@/components/promo/Countdown";
import Confetti from "@/components/ui/Confetti";

export default function PromoSection() {
  const { lang, activePromos, claimPromo, claimedPromos, updatePromo, format } = useApp();
  const [confetti, setConfetti] = useState(0);
  const promo = activePromos.find((p) => p.placements.includes("home"));
  if (!promo) return null;

  const labels = lang === "ar" ? { d: "يوم", h: "ساعة", m: "دقيقة", s: "ثانية" } : { d: "Days", h: "Hrs", m: "Min", s: "Sec" };
  const claimed = claimedPromos.includes(promo.id);
  const claim = () => { claimPromo(promo.id); setConfetti((n) => n + 1); };

  return (
    <section className="section-pad relative overflow-hidden bg-ink">
      <Confetti trigger={confetti} />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/12 via-transparent to-transparent p-8 md:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                <Zap size={13} /> {lang === "ar" ? "عرض محدود" : "Limited offer"} · -{promo.discountPercent}%
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">
                <span className="text-gold-gradient">{lang === "ar" ? promo.title : promo.titleEn}</span>
              </h2>
              <p className="mt-3 max-w-md text-cream/60">
                {lang === "ar" ? "خصومات ذهبية على تشكيلة مختارة من أفخم حلوياتنا. العرض ينتهي تلقائياً عند انتهاء الوقت." : "Golden savings on a curated selection of our finest sweets. The offer ends automatically when the timer runs out."}
              </p>
              <div className="mt-6"><Countdown endsAt={promo.endsAt} labels={labels} onExpire={() => updatePromo(promo.id, { active: false })} /></div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {claimed ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-3 font-semibold text-emerald-300"><Check size={18} /> {lang === "ar" ? "تم تفعيل العرض" : "Offer claimed"}{promo.couponCode ? ` · ${promo.couponCode}` : ""}</span>
                ) : (
                  <button onClick={claim} className="btn-gold"><Gift size={18} /> {lang === "ar" ? "احصل على العرض" : "Claim offer"}</button>
                )}
                <Link href="/products" className="btn-outline-gold">{lang === "ar" ? "تسوّق المجموعة" : "Shop the collection"}</Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {promo.productIds.map(getProduct).filter(Boolean).slice(0, 3).map((p: any, i: number) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/products/${p.id}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image src={p.images[0]} alt={lang === "ar" ? p.name : p.nameEn} fill sizes="200px" className="object-cover transition duration-700 group-hover:scale-110" />
                      <span className="absolute start-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">-{promo.discountPercent}%</span>
                    </div>
                    <p className="mt-2 truncate text-sm text-cream/80">{lang === "ar" ? p.name : p.nameEn}</p>
                    <p className="text-sm font-bold text-gold">{format(discountedPrice(p) * (1 - promo.discountPercent / 100))}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
