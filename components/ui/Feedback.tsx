"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

// Elegant success / error state animations.
export function SuccessCheck({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.span
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"
      >
        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 }}>
          <Check size={30} />
        </motion.span>
      </motion.span>
      {label && <p className="text-sm text-cream/80">{label}</p>}
    </div>
  );
}

export function ErrorX({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.span
        initial={{ x: 0 }} animate={{ x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.5 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-rose-500/15 text-rose-400"
      >
        <X size={30} />
      </motion.span>
      {label && <p className="text-sm text-cream/80">{label}</p>}
    </div>
  );
}
