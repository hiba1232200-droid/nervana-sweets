"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import Particles from "../ui/Particles";
import Counter from "../ui/Counter";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

const fade: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const { t, lang, activeTheme, daypart, lightIntensity } = useApp();
  const seasonalTag = activeTheme.key !== "default"
    ? (lang === "ar" ? activeTheme.taglineAr : activeTheme.taglineEn) || t.hero.tagline
    : t.hero.tagline;
  const stats = [
    { to: 25000, suffix: "+", l: t.hero.stat1 },
    { to: 120, suffix: "+", l: t.hero.stat2 },
    { to: 25, suffix: "", l: t.hero.stat3 },
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-luxury-radial">
      {/* 3D layer */}
      <div className="absolute inset-0">
        <Hero3D daypart={daypart} lightIntensity={lightIntensity} />
      </div>
      {/* particles + gradient veils */}
      <Particles count={30} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
      <div className="pointer-events-none absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-ink via-ink/50 to-transparent" />

      {/* content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <motion.span custom={0} variants={fade} initial="hidden" animate="show" className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            <Sparkles size={14} /> {seasonalTag}
          </motion.span>

          <motion.h1 custom={1} variants={fade} initial="hidden" animate="show" className="font-display text-6xl font-extrabold leading-none tracking-tight md:text-8xl">
            <span className="gold-shimmer">{t.hero.title}</span>
          </motion.h1>

          <motion.p custom={2} variants={fade} initial="hidden" animate="show" className="mt-4 font-display text-2xl text-cream/90 md:text-3xl">
            {t.hero.subtitle}
          </motion.p>

          <motion.p custom={3} variants={fade} initial="hidden" animate="show" className="mt-4 max-w-xl text-base leading-relaxed text-cream/60">
            {t.hero.desc}
          </motion.p>

          <motion.div custom={4} variants={fade} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-4">
            <Link href="/products" className="btn-gold">{t.hero.cta}</Link>
            <Link href="/#seasonal" className="btn-outline-gold">{t.hero.cta2}</Link>
          </motion.div>

          <motion.div custom={5} variants={fade} initial="hidden" animate="show" className="mt-12 flex gap-8">
            {stats.map((s) => (
              <div key={s.l}>
                <Counter to={s.to} suffix={s.suffix} className="font-display text-3xl font-bold text-gold-gradient md:text-4xl" />
                <div className="mt-1 text-xs uppercase tracking-wider text-cream/50">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/50"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">{t.hero.scroll}</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown size={20} className="text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
