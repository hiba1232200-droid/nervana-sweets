"use client";

import { useState } from "react";
import { Plus, Trash2, Timer as TimerIcon, Pencil } from "lucide-react";
import { useApp, type Promo, type PromoPlacement, isPromoLive } from "@/lib/stores/AppProvider";
import { products } from "@/lib/data/products";
import { PageHead, Card, Btn, Badge, Modal, Field, inputCls, Toggle } from "@/components/admin/ui";
import Countdown from "@/components/promo/Countdown";

const PLACEMENTS: PromoPlacement[] = ["home", "product", "banner", "popup"];
const toLocalInput = (ms: number) => { const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

const blank = (): Omit<Promo, "id"> => ({
  title: "", titleEn: "", discountPercent: 20, productIds: [],
  startsAt: Date.now(), endsAt: Date.now() + 3 * 86400000,
  placements: ["home", "popup"], couponCode: "GOLD20", active: true,
});

export default function PromotionsAdmin() {
  const { promotions, addPromo, updatePromo, removePromo } = useApp();
  const [editing, setEditing] = useState<(Omit<Promo, "id"> & { id?: string }) | null>(null);

  const save = () => {
    if (!editing) return;
    const { id, ...data } = editing;
    if (id) updatePromo(id, data);
    else addPromo(data);
    setEditing(null);
  };
  const status = (p: Promo) => isPromoLive(p) ? <Badge tone="green">Live</Badge> : p.startsAt > Date.now() ? <Badge tone="blue">Scheduled</Badge> : <Badge tone="gray">Expired</Badge>;

  return (
    <div className="space-y-4">
      <PageHead title="Countdown Promotions" desc="Create unlimited limited-time campaigns — auto-expire & restore prices." actions={
        <Btn onClick={() => setEditing(blank())}><Plus size={15} /> New campaign</Btn>
      } />

      <div className="grid gap-3 md:grid-cols-2">
        {promotions.map((p) => (
          <Card key={p.id}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-display text-lg font-bold text-cream">{p.titleEn || p.title}</h3>{status(p)}</div>
                <p className="text-xs text-cream/40">{p.title}</p>
              </div>
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">-{p.discountPercent}%</span>
            </div>
            {isPromoLive(p) ? (
              <Countdown endsAt={p.endsAt} onExpire={() => updatePromo(p.id, { active: false })} />
            ) : (
              <p className="text-sm text-cream/50">{p.startsAt > Date.now() ? `Starts ${new Date(p.startsAt).toLocaleString()}` : `Ended ${new Date(p.endsAt).toLocaleDateString()}`}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-1">
              {p.placements.map((pl) => <Badge key={pl}>{pl}</Badge>)}
              {p.couponCode && <Badge tone="gold">{p.couponCode}</Badge>}
              <Badge tone="blue">{p.productIds.length} products</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center gap-2 text-xs text-cream/60"><Toggle on={p.active} onChange={(v) => updatePromo(p.id, { active: v })} /> Active</div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...p })} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold"><Pencil size={15} /></button>
                <button onClick={() => removePromo(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10"><Trash2 size={15} /></button>
              </div>
            </div>
          </Card>
        ))}
        {promotions.length === 0 && <Card><div className="grid place-items-center gap-2 py-10 text-cream/40"><TimerIcon size={26} /> No campaigns yet.</div></Card>}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Campaign" : "New Campaign"} wide>
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title (AR)"><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Title (EN)"><input className={inputCls} value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} /></Field>
            <Field label="Discount %"><input type="number" className={inputCls} value={editing.discountPercent} onChange={(e) => setEditing({ ...editing, discountPercent: +e.target.value })} /></Field>
            <Field label="Coupon code"><input className={inputCls} value={editing.couponCode || ""} onChange={(e) => setEditing({ ...editing, couponCode: e.target.value.toUpperCase() })} /></Field>
            <Field label="Starts"><input type="datetime-local" className={inputCls} value={toLocalInput(editing.startsAt)} onChange={(e) => setEditing({ ...editing, startsAt: new Date(e.target.value).getTime() })} /></Field>
            <Field label="Ends"><input type="datetime-local" className={inputCls} value={toLocalInput(editing.endsAt)} onChange={(e) => setEditing({ ...editing, endsAt: new Date(e.target.value).getTime() })} /></Field>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs text-cream/60">Placements</span>
              <div className="flex flex-wrap gap-2">
                {PLACEMENTS.map((pl) => {
                  const on = editing.placements.includes(pl);
                  return <button key={pl} onClick={() => setEditing({ ...editing, placements: on ? editing.placements.filter((x) => x !== pl) : [...editing.placements, pl] })} className={`rounded-full px-3 py-1 text-xs ${on ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>{pl}</button>;
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-xs text-cream/60">Products in this campaign</span>
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-xl bg-white/[0.02] p-2">
                {products.map((p) => {
                  const on = editing.productIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-cream/80 hover:bg-white/5">
                      <input type="checkbox" checked={on} onChange={() => setEditing({ ...editing, productIds: on ? editing.productIds.filter((x) => x !== p.id) : [...editing.productIds, p.id] })} className="h-3.5 w-3.5 accent-gold" />
                      {p.nameEn}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="col-span-full flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={save}>{editing.id ? "Save" : "Create campaign"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
