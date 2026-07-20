"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package, CreditCard, Tag, Sparkles, Gift, Star, Ticket, Cake, Bell, Zap, Info, X,
} from "lucide-react";
import { useApp, type NotifKind, type Toast } from "@/lib/stores/AppProvider";

const META: Record<NotifKind, { icon: any; ring: string; bg: string }> = {
  order: { icon: Package, ring: "border-gold/40", bg: "bg-gold/15 text-gold" },
  payment: { icon: CreditCard, ring: "border-emerald-500/40", bg: "bg-emerald-500/15 text-emerald-300" },
  discount: { icon: Tag, ring: "border-rose-500/40", bg: "bg-rose-500/15 text-rose-300" },
  product: { icon: Sparkles, ring: "border-gold/40", bg: "bg-gold/15 text-gold" },
  seasonal: { icon: Gift, ring: "border-gold/40", bg: "bg-gold/15 text-gold" },
  loyalty: { icon: Star, ring: "border-gold/40", bg: "bg-gold/15 text-gold" },
  coupon: { icon: Ticket, ring: "border-amber-500/40", bg: "bg-amber-500/15 text-amber-300" },
  birthday: { icon: Cake, ring: "border-pink-500/40", bg: "bg-pink-500/15 text-pink-300" },
  restock: { icon: Bell, ring: "border-emerald-500/40", bg: "bg-emerald-500/15 text-emerald-300" },
  flash: { icon: Zap, ring: "border-amber-500/40", bg: "bg-amber-500/15 text-amber-300" },
  system: { icon: Info, ring: "border-sky-500/40", bg: "bg-sky-500/15 text-sky-300" },
};

let audioCtx: AudioContext | null = null;
function chime() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = audioCtx || new AC();
    const ctx = audioCtx;
    const notes = [880, 1174];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      o.start(t0); o.stop(t0 + 0.32);
    });
  } catch { /* ignore */ }
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast, notifSound } = useApp();
  const m = META[toast.kind] ?? META.system;

  useEffect(() => {
    if (notifSound) chime();
    const t = setTimeout(() => dismissToast(toast.id), 5200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ ease: [0.22, 1, 0.36, 1] }}
      className={`glass pointer-events-auto flex w-80 max-w-[88vw] items-start gap-3 rounded-2xl border ${m.ring} p-3.5 shadow-cinematic`}
      role="status"
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${m.bg}`}><m.icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-cream">{toast.title}</p>
        <p className="mt-0.5 text-xs leading-snug text-cream/60">{toast.body}</p>
      </div>
      <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss" className="text-cream/40 hover:text-gold"><X size={15} /></button>
    </motion.div>
  );
}

export default function Toaster() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed top-24 z-[95] flex flex-col gap-2 ltr:right-6 rtl:left-6">
      <AnimatePresence initial={false}>
        {toasts.slice(-4).map((t) => <ToastItem key={t.id} toast={t} />)}
      </AnimatePresence>
    </div>
  );
}
