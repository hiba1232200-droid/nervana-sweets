"use client";

import { motion } from "framer-motion";

// Luxury full-screen loading animation — spinning gold ring + shimmering brand.
export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[220] grid place-items-center bg-luxury-radial">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--accent, #D4AF37)", borderRightColor: "var(--accent-2, #E8C766)" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          />
          <motion.span
            className="absolute inset-3 rounded-full border border-transparent"
            style={{ borderBottomColor: "var(--accent, #D4AF37)" }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          />
          <span className="absolute inset-0 grid place-items-center font-display text-2xl font-bold text-gold">N</span>
        </div>
        <div className="gold-shimmer font-display text-2xl font-bold tracking-[0.3em]">NERVANA</div>
        {label && <p className="text-xs uppercase tracking-widest text-cream/40">{label}</p>}
      </div>
    </div>
  );
}
