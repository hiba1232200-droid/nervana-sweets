"use client";

import { useState } from "react";
import { ShoppingCart, XCircle, PackageX, UserPlus, Star, MessageSquare, CheckCheck } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import type { NotifType } from "@/lib/admin/seed";
import { PageHead, Card, Btn, Badge } from "@/components/admin/ui";

const meta: Record<NotifType, { icon: any; tone: any; label: string }> = {
  order: { icon: ShoppingCart, tone: "gold", label: "New Orders" },
  cancel: { icon: XCircle, tone: "rose", label: "Cancelled" },
  stock: { icon: PackageX, tone: "amber", label: "Low Stock" },
  user: { icon: UserPlus, tone: "blue", label: "New Users" },
  review: { icon: Star, tone: "gold", label: "Reviews" },
  message: { icon: MessageSquare, tone: "green", label: "Messages" },
};

export default function NotificationsAdmin() {
  const { notifs, markAllRead, unread, pushNotif } = useAdmin();
  const [filter, setFilter] = useState<NotifType | "all">("all");
  const list = notifs.filter((n) => filter === "all" || n.type === filter);

  return (
    <div className="space-y-4">
      <PageHead title="Notifications" desc={`${unread} unread`} actions={
        <Btn variant="outline" size="sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</Btn>
      } />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === "all" ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>All</button>
        {(Object.keys(meta) as NotifType[]).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === k ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>{meta[k].label}</button>
        ))}
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs text-cream/40">Test triggers:</span>
          <button onClick={() => pushNotif("cancel", "Order cancelled", "NV-TEST cancelled by customer")} className="text-xs text-rose-300 underline">cancel</button>
          <button onClick={() => pushNotif("stock", "Low stock", "Kunafa · 2 left")} className="text-xs text-amber-300 underline">low stock</button>
          <button onClick={() => pushNotif("user", "New user", "New customer registered")} className="text-xs text-sky-300 underline">new user</button>
          <button onClick={() => pushNotif("review", "New review", "★★★★★ on Baklava")} className="text-xs text-gold underline">review</button>
          <button onClick={() => pushNotif("message", "Contact message", "New contact form message")} className="text-xs text-emerald-300 underline">message</button>
        </div>
        <ul className="space-y-2">
          {list.map((n) => {
            const M = meta[n.type];
            return (
              <li key={n.id} className={`flex items-start gap-3 rounded-xl p-3 ${n.read ? "bg-white/[0.02]" : "bg-gold/5"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5`}><M.icon size={16} className="text-gold" /></span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cream">{n.title}</p>
                  <p className="text-xs text-cream/50">{n.text}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-cream/40">{new Date(n.date).toLocaleString()}</span>
                  {!n.read && <Badge tone="gold">new</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
