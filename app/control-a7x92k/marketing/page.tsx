"use client";

import { useState } from "react";
import { Plus, Trash2, Ticket, Gift, Share2, Sparkles, Send, Mail } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import type { Coupon } from "@/lib/admin/seed";
import { PageHead, Card, Table, Badge, Btn, Modal, Field, inputCls, Toggle } from "@/components/admin/ui";

export default function MarketingAdmin() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon, pushNotif } = useAdmin();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Coupon>({ code: "", type: "percent", value: 10, uses: 0, limit: 100, active: true, expiry: "2026-12-31" });
  const [loyalty, setLoyalty] = useState({ perDollar: 1, redeemRate: 100 });
  const [pushMsg, setPushMsg] = useState("");

  return (
    <div className="space-y-4">
      <PageHead title="Marketing" desc="Coupons, loyalty, referrals & campaigns." actions={
        <Btn onClick={() => setAdding(true)}><Plus size={15} /> New Coupon</Btn>
      } />

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Ticket size={18} className="text-gold" /> Coupons & Discount Codes</h3>
        <Table head={["Code", "Value", "Used", "Limit", "Expiry", "Active", "Actions"]}>
          {coupons.map((c) => (
            <tr key={c.code}>
              <td className="px-4 py-2.5 font-mono font-bold text-gold">{c.code}</td>
              <td className="px-4 py-2.5 text-cream/80">{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
              <td className="px-4 py-2.5 text-cream/60">{c.uses}</td>
              <td className="px-4 py-2.5 text-cream/60">{c.limit || "∞"}</td>
              <td className="px-4 py-2.5 text-cream/60">{c.expiry}</td>
              <td className="px-4 py-2.5"><Toggle on={c.active} onChange={() => toggleCoupon(c.code)} /></td>
              <td className="px-4 py-2.5"><button onClick={() => deleteCoupon(c.code)} className="grid h-7 w-7 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-cream"><Gift size={16} className="text-gold" /> Loyalty Points</h3>
          <Field label="Points per $1"><input type="number" className={inputCls} value={loyalty.perDollar} onChange={(e) => setLoyalty({ ...loyalty, perDollar: +e.target.value })} /></Field>
          <div className="mt-2"><Field label="Points per $1 redeem"><input type="number" className={inputCls} value={loyalty.redeemRate} onChange={(e) => setLoyalty({ ...loyalty, redeemRate: +e.target.value })} /></Field></div>
        </Card>
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-cream"><Share2 size={16} className="text-gold" /> Referral Program</h3>
          <p className="text-sm text-cream/60">Give $5, get $5 for every friend who orders.</p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] p-2"><span className="text-sm text-cream/70">Enabled</span><Toggle on onChange={() => {}} /></div>
        </Card>
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-cream"><Sparkles size={16} className="text-gold" /> Seasonal Campaign</h3>
          <p className="text-sm text-cream/60">Ramadan · Eid · Winter collections.</p>
          <Btn size="sm" variant="outline" className="mt-3">Launch campaign</Btn>
        </Card>
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-cream"><Mail size={16} className="text-gold" /> Email Campaign</h3>
          <p className="text-sm text-cream/60">Reach 25,480 subscribers.</p>
          <Btn size="sm" variant="outline" className="mt-3">Compose email</Btn>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Send size={18} className="text-gold" /> Push Notification</h3>
        <div className="flex gap-2">
          <input value={pushMsg} onChange={(e) => setPushMsg(e.target.value)} placeholder="Notify all customers…" className={inputCls} />
          <Btn onClick={() => { if (pushMsg.trim()) { pushNotif("message", "Push sent", pushMsg.trim()); setPushMsg(""); } }}><Send size={14} /> Send</Btn>
        </div>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="New Coupon">
        <div className="space-y-3">
          <Field label="Code"><input className={inputCls} value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputCls} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}>
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed $</option>
              </select>
            </Field>
            <Field label="Value"><input type="number" className={inputCls} value={draft.value} onChange={(e) => setDraft({ ...draft, value: +e.target.value })} /></Field>
            <Field label="Usage limit (0 = ∞)"><input type="number" className={inputCls} value={draft.limit} onChange={(e) => setDraft({ ...draft, limit: +e.target.value })} /></Field>
            <Field label="Expiry"><input type="date" className={inputCls} value={draft.expiry} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn onClick={() => { if (draft.code) { addCoupon(draft); setAdding(false); setDraft({ code: "", type: "percent", value: 10, uses: 0, limit: 100, active: true, expiry: "2026-12-31" }); } }}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
