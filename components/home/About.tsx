"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Leaf, Truck, Crown } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";

export default function About() {
  const { t, lang } = useApp();
  const story = lang === "ar"
    ? "منذ أكثر من 25 عاماً، تصنع نيرفانا أرقى الحلويات الشرقية بأيدٍ ماهرة توارثت أسرار الصنعة جيلاً بعد جيل. نمزج بين أصالة الوصفات التراثية وأناقة التقديم العصري، لنقدّم لك تجربة ذوق لا تُنسى في كل قضمة."
    : "For over 25 years, NERVANA has crafted the finest oriental sweets by skilled hands that inherited the secrets of the craft generation after generation. We blend the authenticity of heritage recipes with modern elegance, delivering an unforgettable taste experience in every bite.";

  const features = [
    { icon: Leaf, ar: "مكوّنات طبيعية 100%", en: "100% Natural Ingredients" },
    { icon: Award, ar: "جودة حائزة على جوائز", en: "Award-Winning Quality" },
    { icon: Truck, ar: "توصيل خلال 10-30 دقيقة", en: "Delivery in 10-30 min" },
    { icon: Crown, ar: "تغليف فاخر ملكي", en: "Royal Luxury Packaging" },
  ];

  return (
    <section id="about" className="section-pad relative overflow-hidden bg-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image src="https://images.unsplash.com/photo-1587244141733-cc3e5f6f76b6?auto=format&fit=crop&w=900&q=80" alt="NERVANA craft" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          </div>
          <div className="absolute -bottom-6 rounded-3xl glass p-5 text-center ltr:-right-6 rtl:-left-6">
            <div className="font-display text-4xl font-bold text-gold-gradient">25+</div>
            <div className="text-xs uppercase tracking-widest text-cream/60">{t.hero.stat3}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-gold/80">{t.brandSub}</span>
          <h2 className="mt-3 font-display text-4xl font-bold text-cream md:text-5xl">
            <span className="text-gold-gradient">{t.sections.about}</span>
          </h2>
          <p className="mt-5 leading-relaxed text-cream/70">{story}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.en} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><f.icon size={20} /></span>
                <span className="text-sm font-medium text-cream/90">{lang === "ar" ? f.ar : f.en}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
