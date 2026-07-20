"use client";

import { useState } from "react";
import { Tag, Percent, RotateCcw, CalendarClock, Check } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { PageHead, Card, Table, Badge, Btn, Field, inputCls } from "@/components/admin/ui";

export default function PricingAdmin() {
  const { products, setPrice, bulkPrice, applyDiscount, restorePrice, scheduleDiscount } = useAdmin();
  const { sypRate, format } = useApp();
  const [sel, setSel] = useState<string[]>([]);
  const [bulk, setBulk] = useState<{ mode: "set" | "increase" | "decrease"; value: number }>({ mode: "increase", value: 10 });
  const [sched, setSched] = useState({ percent: 15, start: "", end: "" });

  const syp = (usd: number) => Math.round(usd * sypRate).toLocaleString("en-US");
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-4">
      <PageHead title="Pricing Management" desc="Edit prices in USD — SYP is calculated automatically from the exchange rate." />

      {/* Bulk tools */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Tag size={18} className="text-gold" /> Bulk Price Edit {sel.length > 0 && <Badge tone="gold">{sel.length} selected</Badge>}</h3>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Action">
              <select className={inputCls} value={bulk.mode} onChange={(e) => setBulk({ ...bulk, mode: e.target.value as any })}>
                <option value="set">Set price to (USD)</option>
                <option value="increase">Increase by (%)</option>
                <option value="decrease">Decrease by (%)</option>
              </select>
            </Field>
            <Field label="Value"><input type="number" className={inputCls + " w-28"} value={bulk.value} onChange={(e) => setBulk({ ...bulk, value: +e.target.value })} /></Field>
            <Btn onClick={() => { if (sel.length) { bulkPrice(sel, bulk.mode, bulk.value); setSel([]); } }} disabled={!sel.length}><Check size={14} /> Apply</Btn>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><CalendarClock size={18} className="text-gold" /> Schedule Discount</h3>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Discount %"><input type="number" className={inputCls + " w-24"} value={sched.percent} onChange={(e) => setSched({ ...sched, percent: +e.target.value })} /></Field>
            <Field label="Start"><input type="date" className={inputCls} value={sched.start} onChange={(e) => setSched({ ...sched, start: e.target.value })} /></Field>
            <Field label="End"><input type="date" className={inputCls} value={sched.end} onChange={(e) => setSched({ ...sched, end: e.target.value })} /></Field>
            <Btn variant="outline" onClick={() => { if (sel.length) { scheduleDiscount(sel, sched.percent, sched.start, sched.end); setSel([]); } }} disabled={!sel.length}>Schedule</Btn>
          </div>
        </Card>
      </div>

      <Table head={["", "Product", "USD Price", "Discount", "Effective", "SYP (auto)", "Schedule", "Actions"]}>
        {products.map((p) => {
          const effective = p.price * (1 - p.discount / 100);
          return (
            <tr key={p.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3"><input type="checkbox" checked={sel.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-gold" /></td>
              <td className="px-4 py-3"><p className="font-medium text-cream">{p.nameEn}</p><p className="text-xs text-cream/40">{p.name}</p></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="text-cream/50">$</span>
                  <input type="number" defaultValue={p.price} onBlur={(e) => setPrice(p.id, +e.target.value)} className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-cream outline-none focus:border-gold" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <input type="number" value={p.discount} onChange={(e) => applyDiscount(p.id, +e.target.value)} className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-cream outline-none focus:border-gold" />
                  <Percent size={12} className="text-cream/40" />
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-gold">{format(effective)}</td>
              <td className="px-4 py-3 text-cream/70">{syp(effective)} <span className="text-xs text-cream/40">SYP</span></td>
              <td className="px-4 py-3 text-xs text-cream/50">
                {p.discountStart ? <Badge tone="blue">{p.discountStart} → {p.discountEnd || "…"}</Badge> : <span className="text-cream/30">—</span>}
              </td>
              <td className="px-4 py-3">
                <button onClick={() => restorePrice(p.id)} disabled={!p.originalPrice} title="Restore original price"
                  className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold disabled:opacity-30">
                  <RotateCcw size={15} />
                </button>
              </td>
            </tr>
          );
        })}
      </Table>

      <p className="text-xs text-cream/40">Prices are entered in USD. SYP amounts recalculate instantly when the exchange rate changes in <b className="text-gold">Currency</b>. Effective prices, invoices and the storefront all update automatically.</p>
    </div>
  );
}
