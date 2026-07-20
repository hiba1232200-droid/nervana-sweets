"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { products, discountedPrice } from "@/lib/data/products";

function useCountdown(hours = 12) {
  const [t, setT] = useState(hours * 3600);
  useEffect(() => {
    const i = setInterval(() => setT((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return { h, m, s };
}

export default function Offers() {
  const { t, lang, format, addToCart } = useApp();
  const { h, m, s } = useCountdown(9);
  const deals = products.filter((p) => p.discount > 0).slice(0, 3);
  const strip = lang === "ar"
    ? "توصيل خلال 10-30 دقيقة • شحن مجاني للطلبات فوق 50$ • تغليف فاخر مجاني • نقاط ولاء على كل طلب •"
    : "Delivery in 10-30 min • Free shipping over $50 • Complimentary luxury packaging • Loyalty points on every order •";

  return (
    <section id="offers" className="relative overflow-hidden bg-ink py-24">
      {/* marquee strip */}
      <div className="mb-16 overflow-hidden border-y border-gold/20 bg-gold/5 py-3">
        <div className="marquee text-sm font-semibold uppercase tracking-widest text-gold">
          <span className="px-4">{strip}</span>
          <span className="px-4">{strip}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-gold/80">{t.sections.offersSub}</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-cream md:text-5xl">
              <span className="text-gold-gradient">{t.sections.offers}</span>
            </h2>
            <p className="mt-4 max-w-md text-cream/60">{t.footer.about}</p>
            <div className="mt-6 flex items-center gap-3">
              <Timer className="text-gold" />
              {[h, m, s].map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl glass font-display text-2xl font-bold text-gold">{v}</div>
                  {i < 2 && <span className="text-2xl text-gold">:</span>}
                </div>
              ))}
            </div>
            <Link href="/products" className="btn-gold mt-8">{t.hero.cta}</Link>
          </motion.div>

          <div className="space-y-4">
            {deals.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex items-center gap-4 rounded-2xl glass p-3"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.images[0]} alt="" fill className="object-cover" sizes="96px" />
                  <span className="absolute start-1 top-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">-{p.discount}%</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-cream">{lang === "ar" ? p.name : p.nameEn}</h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gold">{format(discountedPrice(p))}</span>
                    <span className="text-sm text-white/40 line-through">{format(p.price)}</span>
                  </div>
                </div>
                <button onClick={() => addToCart(p.id)} className="btn-gold px-5 py-2 text-sm">{t.product.addToCart}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
