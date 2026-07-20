"use client";

import { Minus, Plus, AlertTriangle, PackageX } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { PageHead, Card, Table, Badge, StatCard, Toggle } from "@/components/admin/ui";

export default function InventoryAdmin() {
  const { products, adjustStock, inventoryLog, disableAtZero, setDisableAtZero } = useAdmin();
  const low = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const out = products.filter((p) => p.stock === 0);

  return (
    <div className="space-y-4">
      <PageHead title="Inventory Management" desc="Live stock levels, alerts and history." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total SKUs" value={products.length} />
        <StatCard label="Low Stock" value={low.length} tone="amber" icon={AlertTriangle} />
        <StatCard label="Out of Stock" value={out.length} tone="rose" icon={PackageX} />
        <StatCard label="Total Units" value={products.reduce((s, p) => s + p.stock, 0)} tone="green" />
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-cream">Disable ordering when stock reaches zero</p>
          <p className="text-xs text-cream/50">Automatically hides the add-to-cart button for out-of-stock items.</p>
        </div>
        <Toggle on={disableAtZero} onChange={setDisableAtZero} />
      </Card>

      {(low.length > 0 || out.length > 0) && (
        <Card>
          <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-cream"><AlertTriangle size={18} className="text-amber-400" /> Alerts</h3>
          <div className="flex flex-wrap gap-2">
            {out.map((p) => <Badge key={p.id} tone="rose">{p.nameEn} · out of stock</Badge>)}
            {low.map((p) => <Badge key={p.id} tone="amber">{p.nameEn} · {p.stock} left</Badge>)}
          </div>
        </Card>
      )}

      <Table head={["Product", "Supplier", "Stock", "Status", "Adjust"]}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3 font-medium text-cream">{p.nameEn}</td>
            <td className="px-4 py-3 text-cream/60">{p.supplier}</td>
            <td className="px-4 py-3 font-semibold text-gold">{p.stock}</td>
            <td className="px-4 py-3"><Badge tone={p.stock === 0 ? "rose" : p.stock <= 5 ? "amber" : "green"}>{p.stock === 0 ? "Out" : p.stock <= 5 ? "Low" : "In stock"}</Badge></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => adjustStock(p.id, -1, "Manual adjustment")} className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 hover:bg-rose-500/20"><Minus size={13} /></button>
                <button onClick={() => adjustStock(p.id, 1, "Manual adjustment")} className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 hover:bg-emerald-500/20"><Plus size={13} /></button>
                <button onClick={() => adjustStock(p.id, 20, "Restock")} className="rounded-lg bg-gold/10 px-2 py-1 text-xs text-gold hover:bg-gold/20">+20 Restock</button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Inventory History</h3>
        <Table head={["Product", "Change", "Reason", "Date"]}>
          {inventoryLog.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-2.5 text-cream/80">{l.product}</td>
              <td className="px-4 py-2.5"><Badge tone={l.change >= 0 ? "green" : "rose"}>{l.change >= 0 ? "+" : ""}{l.change}</Badge></td>
              <td className="px-4 py-2.5 text-cream/60">{l.reason}</td>
              <td className="px-4 py-2.5 text-cream/40">{new Date(l.date).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
