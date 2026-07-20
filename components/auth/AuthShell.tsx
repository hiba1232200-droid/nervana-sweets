"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Particles from "@/components/ui/Particles";

// Shared premium black-&-gold frame for all authentication screens.
export default function AuthShell({
  title, subtitle, children, footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-luxury-radial px-4 py-16">
      <Particles count={24} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-gold/20 bg-ink-soft/70 p-8 backdrop-blur-xl shadow-cinematic"
      >
        <Link href="/" className="mb-6 flex flex-col items-center gap-1">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 font-display text-2xl font-bold text-gold">N</span>
          <span className="mt-2 font-display text-xl font-bold text-gold-gradient">NERVANA</span>
        </Link>

        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-cream">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-cream/50">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-cream/60">{footer}</div>}
      </motion.div>
    </div>
  );
}

export const authInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none transition focus:border-gold placeholder:text-white/35";
