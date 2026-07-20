"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Printer, Download, ChevronDown, XCircle, RotateCcw, Bell } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { PageHead, Btn, Badge, Card } from "@/components/admin/ui";

const STATUS = ["Pending", "Preparing", "Ready", "Out for Delivery", "Delivered"];
const statusTone = ["amber", "blue", "gold", "blue", "green"] as const;

export default function OrdersAdmin() {
  const { orders, importOrders, setOrderStatus, cancelOrder, refundOrder, assignDriver, employees, simulateNewOrder } = useAdmin();
  const { orders: liveOrders, format } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Bring real customer checkouts into the dashboard.
  useEffect(() => { if (liveOrders.length) importOrders(liveOrders); }, [liveOrders, importOrders]);

  const drivers = employees.filter((e) => e.role === "driver");

  const list = useMemo(() => orders.filter((o) => {
    if (filter === "cancelled" && o.state !== "cancelled") return false;
    if (filter === "refunded" && o.state !== "refunded") return false;
    if (filter === "active" && (o.state !== "active" || o.status === 4)) return false;
    if (filter === "delivered" && o.status !== 4) return false;
    const s = `${o.id} ${o.customer.name} ${o.customer.phone}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [orders, q, filter]);

  const exportCsv = () => {
    const rows = [
      ["Order", "Customer", "Phone", "Address", "Items", "Subtotal", "Delivery", "Discount", "Coupon", "Total", "Payment", "PayStatus", "Status", "Driver", "Date", "Notes"],
      ...list.map((o) => [
        o.id, o.customer.name, o.customer.phone,
        `${o.customer.address} ${o.customer.street} ${o.customer.building}`,
        o.items.map((i) => `${i.nameEn} x${i.qty}`).join("; "),
        o.subtotal ?? "", o.deliveryFee ?? "", o.discount ?? "", o.coupon ?? "",
        o.total, o.paymentMethod ?? "", o.paymentStatus ?? "",
        o.state !== "active" ? o.state : STATUS[o.status], o.driver ?? "",
        new Date(o.date).toLocaleString(), o.customer.notes,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "nervana-orders.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <PageHead title="Orders Management" desc={`${orders.length} orders`} actions={
        <>
          <Btn variant="outline" size="sm" onClick={simulateNewOrder}><Bell size={14} /> Simulate order</Btn>
          <Btn variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} /> Print</Btn>
          <Btn size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Btn>
        </>
      } />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <Search size={15} className="text-cream/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name, phone…" className="w-56 bg-transparent text-sm outline-none" />
        </div>
        {["all", "active", "delivered", "cancelled", "refunded"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${filter === f ? "bg-gold text-ink" : "bg-white/5 text-cream/60 hover:bg-white/10"}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((o) => {
          const open = openRow === o.id;
          return (
            <Card key={o.id} className="!p-0 overflow-hidden">
              <button onClick={() => setOpenRow(open ? null : o.id)} className="flex w-full flex-wrap items-center gap-3 p-4 text-start hover:bg-white/[0.02]">
                <span className="font-mono text-sm font-bold text-gold">{o.id}</span>
                <span className="text-sm text-cream">{o.customer.name}</span>
                <span className="hidden text-xs text-cream/50 sm:block">{o.customer.phone}</span>
                <span className="ms-auto text-sm font-bold text-gold">{format(o.total)}</span>
                {o.state === "cancelled" ? <Badge tone="rose">Cancelled</Badge>
                  : o.state === "refunded" ? <Badge tone="gray">Refunded</Badge>
                  : <Badge tone={statusTone[o.status]}>{STATUS[o.status]}</Badge>}
                <ChevronDown size={16} className={`text-cream/40 transition ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="border-t border-white/10 bg-white/[0.02] p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-gold/70">Customer</p>
                      <p className="text-sm text-cream">{o.customer.name}</p>
                      <p className="text-xs text-cream/60">{o.customer.phone}</p>
                      <p className="text-xs text-cream/60">{o.customer.address}</p>
                      <p className="text-xs text-cream/60">{o.customer.street} · Bldg {o.customer.building || "—"}</p>
                      {o.customer.notes && <p className="mt-1 text-xs text-amber-300/80">“{o.customer.notes}”</p>}
                    </div>
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-gold/70">Items</p>
                      <ul className="space-y-1 text-sm">
                        {o.items.map((i, k) => (
                          <li key={k} className="flex justify-between text-cream/80">
                            <span>{i.nameEn} × {i.qty}</span>
                            <span className="text-cream/60">{format(i.price * i.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2 text-xs text-cream/60">
                        <div className="flex justify-between"><span>Subtotal</span><span>{format(o.subtotal ?? 0)}</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>{format(o.deliveryFee ?? 0)}</span></div>
                        <div className="flex justify-between"><span>Discount {o.coupon ? `(${o.coupon})` : ""}</span><span>- {format(o.discount ?? 0)}</span></div>
                        <div className="flex justify-between font-bold text-gold"><span>Total</span><span>{format(o.total)}</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-gold/70">Fulfilment</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><span className="text-cream/50">Payment:</span> <Badge tone={o.paymentStatus === "paid" ? "green" : o.paymentStatus === "refunded" ? "gray" : "amber"}>{o.paymentMethod} · {o.paymentStatus}</Badge></div>
                        <div className="flex items-center gap-2"><span className="text-cream/50">Date:</span> <span className="text-xs text-cream/70">{new Date(o.date).toLocaleString()}</span></div>
                        <label className="block">
                          <span className="text-cream/50">Status</span>
                          <select value={o.status} onChange={(e) => setOrderStatus(o.id, +e.target.value)} disabled={o.state !== "active"} className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-2 py-1.5 text-sm outline-none disabled:opacity-40">
                            {STATUS.map((s, i) => <option key={s} value={i}>{s}</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-cream/50">Delivery driver</span>
                          <select value={o.driver || ""} onChange={(e) => assignDriver(o.id, e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-2 py-1.5 text-sm outline-none">
                            <option value="—">Unassigned</option>
                            {drivers.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                          </select>
                        </label>
                        <div className="flex gap-2 pt-1">
                          <Btn variant="danger" size="sm" onClick={() => cancelOrder(o.id)}><XCircle size={13} /> Cancel</Btn>
                          <Btn variant="ghost" size="sm" onClick={() => refundOrder(o.id)}><RotateCcw size={13} /> Refund</Btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
