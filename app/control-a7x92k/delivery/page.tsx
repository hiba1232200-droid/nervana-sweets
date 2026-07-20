"use client";

import { useState } from "react";
import { Truck, Clock, MapPin, Plus, X, Store, Wrench } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { PageHead, Card, Field, inputCls, Toggle, Badge, Btn } from "@/components/admin/ui";

export default function DeliveryAdmin() {
  const { settings, setSettings, storeOpen } = useApp();
  const [areas, setAreas] = useState(["دمشق Damascus", "حلب Aleppo", "حمص Homs", "اللاذقية Latakia"]);
  const [newArea, setNewArea] = useState("");

  return (
    <div className="space-y-4">
      <PageHead title="Delivery Management" desc="Fees, areas, hours and store availability." actions={
        <Badge tone={storeOpen ? "green" : "rose"}><span className="inline-flex items-center gap-1"><Store size={11} /> {storeOpen ? "Open now" : "Closed"}</span></Badge>
      } />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Truck size={18} className="text-gold" /> Fees & Rules</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery fee (USD)"><input type="number" className={inputCls} value={settings.deliveryFee} onChange={(e) => setSettings({ deliveryFee: +e.target.value })} /></Field>
            <Field label="Minimum order (USD)"><input type="number" className={inputCls} value={settings.minOrder} onChange={(e) => setSettings({ minOrder: +e.target.value })} /></Field>
            <Field label="Free delivery over (USD)"><input type="number" className={inputCls} value={settings.freeDeliveryOver} onChange={(e) => setSettings({ freeDeliveryOver: +e.target.value })} /></Field>
            <Field label="Delivery time"><input className={inputCls} defaultValue="10–30 min" readOnly /></Field>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><Clock size={18} className="text-gold" /> Working Hours</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Open hour (0–23)"><input type="number" min={0} max={23} className={inputCls} value={settings.openHour} onChange={(e) => setSettings({ openHour: +e.target.value })} /></Field>
            <Field label="Close hour (1–24)"><input type="number" min={1} max={24} className={inputCls} value={settings.closeHour} onChange={(e) => setSettings({ closeHour: +e.target.value })} /></Field>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-sm text-cream/80"><Store size={15} className="text-gold" /> Manually close store</span>
              <Toggle on={settings.manualClosed} onChange={(v) => setSettings({ manualClosed: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <span className="flex items-center gap-2 text-sm text-cream/80"><Wrench size={15} className="text-gold" /> Maintenance mode</span>
              <Toggle on={settings.maintenanceMode} onChange={(v) => setSettings({ maintenanceMode: v })} />
            </div>
          </div>
          {!storeOpen && (
            <p className="mt-3 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-200">
              Checkout is disabled. Customers see: “We are currently closed. Orders will resume during business hours.”
            </p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-cream"><MapPin size={18} className="text-gold" /> Delivery Areas</h3>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <span key={a} className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-cream/80">
              {a}
              <button onClick={() => setAreas(areas.filter((x) => x !== a))} className="text-cream/40 hover:text-rose-400"><X size={13} /></button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Add area…" className={inputCls + " max-w-xs"} />
          <Btn onClick={() => { if (newArea.trim()) { setAreas([...areas, newArea.trim()]); setNewArea(""); } }}><Plus size={14} /> Add</Btn>
        </div>
      </Card>
    </div>
  );
}
