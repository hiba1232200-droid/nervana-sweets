"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

// Subtle golden celebration burst. Re-fires whenever `trigger` changes.
export default function Confetti({ trigger }: { trigger: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }).map((_, i) => ({
        id: `${trigger}-${i}`,
        x: (Math.random() - 0.5) * 520,
        y: -(Math.random() * 420 + 120),
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.15,
        color: ["#D4AF37", "#F0E0B0", "#E8C766", "#FFFFFF"][i % 4],
        size: 6 + Math.random() * 8,
      })),
    [trigger]
  );

  if (!trigger) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot, scale: 0.6 }}
          transition={{ duration: 1.3, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
          className="absolute rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.5, background: p.color }}
        />
      ))}
    </div>
  );
}
