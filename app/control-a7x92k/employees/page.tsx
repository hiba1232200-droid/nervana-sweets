"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Shield, UserCog, Bike } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import type { Employee } from "@/lib/admin/seed";
import { PageHead, Table, Badge, Btn, Modal, Field, inputCls, Toggle } from "@/components/admin/ui";

const ALL_PERMS = ["orders", "products", "inventory", "customers", "marketing", "delivery", "reports", "settings", "all"];
const roleIcon = { admin: Shield, manager: UserCog, driver: Bike } as const;
const roleTone = { admin: "gold", manager: "blue", driver: "green" } as const;

export default function EmployeesAdmin() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAdmin();
  const [editing, setEditing] = useState<Partial<Employee> | null>(null);

  const save = () => {
    if (!editing) return;
    if (editing.id) updateEmployee(editing.id, editing);
    else addEmployee(editing);
    setEditing(null);
  };
  const togglePerm = (p: string) => {
    if (!editing) return;
    const has = editing.permissions?.includes(p);
    setEditing({ ...editing, permissions: has ? editing.permissions!.filter((x) => x !== p) : [...(editing.permissions || []), p] });
  };

  return (
    <div className="space-y-4">
      <PageHead title="Employee Management" desc="Roles, permissions, drivers & managers." actions={
        <Btn onClick={() => setEditing({ name: "", email: "", phone: "", role: "driver", permissions: [], active: true })}><Plus size={15} /> Add Employee</Btn>
      } />

      <Table head={["Employee", "Role", "Permissions", "Status", "Actions"]}>
        {employees.map((e) => {
          const Icon = roleIcon[e.role];
          return (
            <tr key={e.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3"><p className="font-medium text-cream">{e.name}</p><p className="text-xs text-cream/40">{e.email} · {e.phone}</p></td>
              <td className="px-4 py-3"><Badge tone={roleTone[e.role]}><span className="inline-flex items-center gap-1"><Icon size={11} /> {e.role}</span></Badge></td>
              <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{e.permissions.map((p) => <Badge key={p}>{p}</Badge>)}</div></td>
              <td className="px-4 py-3">{e.active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Disabled</Badge>}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(e)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold"><Pencil size={15} /></button>
                  <button onClick={() => deleteEmployee(e.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </Table>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Employee" : "Add Employee"}>
        {editing && (
          <div className="space-y-3">
            <Field label="Full name"><input className={inputCls} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><input className={inputCls} value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputCls} value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
            </div>
            <Field label="Role">
              <select className={inputCls} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as Employee["role"] })}>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="driver">Delivery Driver</option>
              </select>
            </Field>
            <div>
              <span className="mb-2 block text-xs font-medium text-cream/60">Permissions</span>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMS.map((p) => (
                  <button key={p} onClick={() => togglePerm(p)} className={`rounded-full px-3 py-1 text-xs ${editing.permissions?.includes(p) ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <span className="text-sm text-cream/70">Active</span>
              <Toggle on={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={save}>{editing.id ? "Save" : "Add"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
