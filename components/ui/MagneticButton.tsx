"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/stores/AppProvider";

// Magnetic button — gently pulls toward the cursor. No-op in reduced-motion.
export default function MagneticButton({
  children, className, onClick, strength = 0.4,
}: { children: React.ReactNode; className?: string; onClick?: () => void; strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { reducedMotion } = useApp();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const move = (e: React.MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onClick={onClick}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 250, damping: 15, mass: 0.4 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
