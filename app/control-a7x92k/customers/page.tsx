"use client";

import { useMemo, useState } from "react";
import { Search, Ban, Trash2, KeyRound, Eye } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import type { Customer } from "@/lib/admin/seed";
import { PageHead, Table, Badge, Btn, Modal, Card } from "@/components/admin/ui";

export default function CustomersAdmin() {
  const { customers, banCustomer, deleteCustomer } = useAdmin();
  const { format } = useApp();
  const [q, setQ] = useState("");
  const [view, setView] = useState<Customer | null>(null);
  const [reset, setReset] = useState<string | null>(null);

  const list = useMemo(() => customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())
  ), [customers, q]);

  return (
    <div className="space-y-4">
      <PageHead title="Customer Management" desc={`${customers.length} registered customers`} />

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 w-fit">
        <Search size={15} className="text-cream/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="w-56 bg-transparent text-sm outline-none" />
      </div>

      <Table head={["Customer", "Phone", "Orders", "Total Spent", "Status", "Actions"]}>
        {list.map((c) => (
          <tr key={c.id} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3">
              <p className="font-medium text-cream">{c.name}</p>
              <p className="text-xs text-cream/40">{c.email}</p>
            </td>
            <td className="px-4 py-3 text-cream/70">{c.phone}</td>
            <td className="px-4 py-3 text-cream/70">{c.orders}</td>
            <td className="px-4 py-3 font-semibold text-gold">{format(c.spending)}</td>
            <td className="px-4 py-3">{c.banned ? <Badge tone="rose">Banned</Badge> : <Badge tone="green">Active</Badge>}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => setView(c)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="View"><Eye size={15} /></button>
                <button onClick={() => setReset(c.name)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="Reset password"><KeyRound size={15} /></button>
                <button onClick={() => banCustomer(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-amber-300 hover:bg-amber-500/10" title="Ban"><Ban size={15} /></button>
                <button onClick={() => deleteCustomer(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10" title="Delete"><Trash2 size={15} /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || ""} wide>
        {view && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><p className="text-xs text-cream/50">Total Spending</p><p className="mt-1 font-display text-2xl font-bold text-gold">{format(view.spending)}</p></Card>
            <Card><p className="text-xs text-cream/50">Orders</p><p className="mt-1 font-display text-2xl font-bold text-cream">{view.orders}</p></Card>
            <div className="sm:col-span-2">
              <p className="mb-1 text-xs uppercase tracking-wider text-gold/70">Addresses</p>
              {view.addresses.map((a, i) => <p key={i} className="text-sm text-cream/80">{a}</p>)}
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 text-xs uppercase tracking-wider text-gold/70">Favorite Products</p>
              <div className="flex flex-wrap gap-1">{view.favorites.map((f) => <Badge key={f} tone="gold">{f}</Badge>)}</div>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs uppercase tracking-wider text-gold/70">Login History</p>
              <ul className="space-y-1">
                {view.logins.map((l, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                    <span className="text-cream/80">{l.device}</span>
                    <span className="text-cream/40">{l.location} · {new Date(l.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!reset} onClose={() => setReset(null)} title="Reset Password">
        <p className="text-sm text-cream/70">A secure password-reset link has been sent to <b className="text-gold">{reset}</b>.</p>
        <div className="mt-4 flex justify-end"><Btn onClick={() => setReset(null)}>Done</Btn></div>
      </Modal>
    </div>
  );
}
