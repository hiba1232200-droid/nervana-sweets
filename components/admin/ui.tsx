"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("rounded-2xl border border-white/10 bg-ink-soft/80 p-5", className)}>{children}</div>;
}

export function StatCard({
  label, value, icon: Icon, sub, tone = "gold",
}: { label: string; value: string | number; icon?: any; sub?: string; tone?: "gold" | "green" | "rose" | "blue" | "amber" }) {
  const tones: Record<string, string> = {
    gold: "text-gold bg-gold/10",
    green: "text-emerald-400 bg-emerald-400/10",
    rose: "text-rose-400 bg-rose-400/10",
    blue: "text-sky-400 bg-sky-400/10",
    amber: "text-amber-400 bg-amber-400/10",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-soft/80 p-4 transition hover:border-gold/30">
      <div className="flex items-center justify-between">
        <span className="text-xs text-cream/50">{label}</span>
        {Icon && <span className={clsx("grid h-8 w-8 place-items-center rounded-lg", tones[tone])}><Icon size={16} /></span>}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-cream">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-cream/40">{sub}</div>}
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "gold" | "green" | "rose" | "amber" | "blue" }) {
  const tones: Record<string, string> = {
    gray: "bg-white/10 text-cream/70",
    gold: "bg-gold/15 text-gold",
    green: "bg-emerald-500/15 text-emerald-300",
    rose: "bg-rose-500/15 text-rose-300",
    amber: "bg-amber-500/15 text-amber-300",
    blue: "bg-sky-500/15 text-sky-300",
  };
  return <span className={clsx("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={clsx("relative h-6 w-11 rounded-full transition", on ? "bg-gold" : "bg-white/15")}
      role="switch"
      aria-checked={on}
    >
      <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function PageHead({ title, desc, actions }: { title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-gold-gradient">{title}</h1>
        {desc && <p className="mt-1 text-sm text-cream/50">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Btn({
  children, onClick, variant = "gold", size = "md", className, type = "button", disabled,
}: {
  children: React.ReactNode; onClick?: () => void; variant?: "gold" | "outline" | "ghost" | "danger";
  size?: "sm" | "md"; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const v: Record<string, string> = {
    gold: "bg-gold text-ink hover:shadow-gold-glow",
    outline: "border border-gold/40 text-gold hover:bg-gold/10",
    ghost: "text-cream/70 hover:bg-white/5",
    danger: "border border-rose-500/40 text-rose-300 hover:bg-rose-500/10",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={clsx("inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:opacity-40",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm", v[variant], className)}>
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={clsx("w-full rounded-2xl border border-white/10 bg-ink-soft p-6 shadow-cinematic", wide ? "max-w-3xl" : "max-w-lg")}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-cream">{title}</h3>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"><X size={16} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-cream/60">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream outline-none focus:border-gold";

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[720px] text-start text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-cream/50">
            {head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 text-start font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
    </div>
  );
}
