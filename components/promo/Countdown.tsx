"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl glass md:h-16 md:w-16">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={v}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute font-display text-2xl font-bold text-gold md:text-3xl"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest text-cream/50">{label}</span>
    </div>
  );
}

// Premium countdown — auto-ends on expiry and calls onExpire once.
export default function Countdown({
  endsAt, onExpire, labels,
}: {
  endsAt: number;
  onExpire?: () => void;
  labels?: { d: string; h: string; m: string; s: string };
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const l = labels ?? { d: "Days", h: "Hours", m: "Min", s: "Sec" };

  useEffect(() => {
    const update = () => {
      const r = endsAt - Date.now();
      setRemaining(r);
      if (r <= 0) { onExpire?.(); return true; }
      return false;
    };
    if (update()) return;
    const id = setInterval(() => { if (update()) clearInterval(id); }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  if (remaining === null) return <div className="h-16" aria-hidden />;
  if (remaining <= 0) return null;
  const p = parts(remaining);

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Unit value={p.d} label={l.d} />
      <span className="text-2xl font-bold text-gold/40">:</span>
      <Unit value={p.h} label={l.h} />
      <span className="text-2xl font-bold text-gold/40">:</span>
      <Unit value={p.m} label={l.m} />
      <span className="text-2xl font-bold text-gold/40">:</span>
      <Unit value={p.s} label={l.s} />
    </div>
  );
}
