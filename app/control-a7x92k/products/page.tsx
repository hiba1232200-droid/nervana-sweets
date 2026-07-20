"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Copy, Star, Search } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp } from "@/lib/stores/AppProvider";
import { categories } from "@/lib/data/products";
import type { AdminProduct } from "@/lib/admin/seed";
import { PageHead, Btn, Table, Badge, Modal, Field, inputCls, Toggle } from "@/components/admin/ui";

const empty: Partial<AdminProduct> = {
  name: "", nameEn: "", category: "baklava", price: 20, discount: 0, weight: "500 غ",
  stock: 20, images: ["https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=1000&q=80"],
  descEn: "", ingredientsEn: "", allergensEn: "", tags: [], seoTitle: "", badges: [],
};

export default function ProductsAdmin() {
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct, bulkUpdate } = useAdmin();
  const { format } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sel, setSel] = useState<string[]>([]);
  const [editing, setEditing] = useState<Partial<AdminProduct> | null>(null);

  const list = useMemo(() => products.filter((p) =>
    (cat === "all" || p.category === cat) &&
    (p.name.includes(q) || p.nameEn.toLowerCase().includes(q.toLowerCase()))
  ), [products, q, cat]);

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const save = () => {
    if (!editing) return;
    if (editing.id) updateProduct(editing.id, editing);
    else addProduct(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <PageHead title="Products Management" desc={`${products.length} products`} actions={
        <Btn onClick={() => setEditing({ ...empty })}><Plus size={15} /> Add Product</Btn>
      } />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <Search size={15} className="text-cream/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-48 bg-transparent text-sm outline-none" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm outline-none">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
        </select>
        {sel.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-gold/10 px-3 py-1.5 text-xs text-gold">
            {sel.length} selected
            <button onClick={() => { bulkUpdate(sel, { badges: ["bestSeller"] }); setSel([]); }} className="underline">Mark best seller</button>
            <button onClick={() => { bulkUpdate(sel, { stock: 0 }); setSel([]); }} className="underline">Set out of stock</button>
          </div>
        )}
      </div>

      <Table head={["", "Product", "Category", "Price", "Stock", "Badges", "Actions"]}>
        {list.map((p) => (
          <tr key={p.id} className="hover:bg-white/[0.02]">
            <td className="px-4 py-3"><input type="checkbox" checked={sel.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-gold" /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg"><Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" /></div>
                <div><p className="font-medium text-cream">{p.nameEn}</p><p className="text-xs text-cream/40">{p.name}</p></div>
              </div>
            </td>
            <td className="px-4 py-3 text-cream/70">{p.category}</td>
            <td className="px-4 py-3">
              <span className="font-semibold text-gold">{format(p.price * (1 - p.discount / 100))}</span>
              {p.discount > 0 && <span className="ms-1 text-xs text-rose-300">-{p.discount}%</span>}
            </td>
            <td className="px-4 py-3">
              <Badge tone={p.stock === 0 ? "rose" : p.stock <= 5 ? "amber" : "green"}>{p.stock}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">{p.badges.map((b) => <Badge key={b} tone="gold">{b}</Badge>)}</div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="Edit"><Pencil size={15} /></button>
                <button onClick={() => duplicateProduct(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="Duplicate"><Copy size={15} /></button>
                <button onClick={() => updateProduct(p.id, { badges: p.badges.includes("bestSeller") ? p.badges.filter((b) => b !== "bestSeller") : [...p.badges, "bestSeller"] })} className="grid h-8 w-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-gold" title="Feature"><Star size={15} /></button>
                <button onClick={() => deleteProduct(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10" title="Delete"><Trash2 size={15} /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Product" : "Add Product"} wide>
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (AR)"><input className={inputCls} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Name (EN)"><input className={inputCls} value={editing.nameEn || ""} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} /></Field>
            <Field label="Category">
              <select className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
              </select>
            </Field>
            <Field label="Subcategory"><input className={inputCls} value={editing.subcategory || ""} onChange={(e) => setEditing({ ...editing, subcategory: e.target.value })} /></Field>
            <Field label="Price (USD)"><input type="number" className={inputCls} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></Field>
            <Field label="Discount (%)"><input type="number" className={inputCls} value={editing.discount ?? 0} onChange={(e) => setEditing({ ...editing, discount: +e.target.value })} /></Field>
            <Field label="Weight"><input className={inputCls} value={editing.weight || ""} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} /></Field>
            <Field label="Stock quantity"><input type="number" className={inputCls} value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: +e.target.value })} /></Field>
            <Field label="Image URL"><input className={inputCls} value={editing.images?.[0] || ""} onChange={(e) => setEditing({ ...editing, images: [e.target.value] })} /></Field>
            <Field label="Video URL (optional)"><input className={inputCls} value={editing.videoUrl || ""} onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })} /></Field>
            <Field label="Ingredients (EN)"><input className={inputCls} value={editing.ingredientsEn || ""} onChange={(e) => setEditing({ ...editing, ingredientsEn: e.target.value })} /></Field>
            <Field label="Allergens (EN)"><input className={inputCls} value={editing.allergensEn || ""} onChange={(e) => setEditing({ ...editing, allergensEn: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Description (EN)"><textarea rows={2} className={inputCls} value={editing.descEn || ""} onChange={(e) => setEditing({ ...editing, descEn: e.target.value })} /></Field></div>
            <Field label="Tags (comma separated)"><input className={inputCls} value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
            <Field label="SEO Title"><input className={inputCls} value={editing.seoTitle || ""} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} /></Field>
            <div className="col-span-full flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <span className="text-sm text-cream/70">Available for ordering</span>
              <Toggle on={(editing.stock ?? 0) > 0} onChange={(v) => setEditing({ ...editing, stock: v ? Math.max(1, editing.stock || 10) : 0 })} />
            </div>
            <div className="col-span-full mt-2 flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={save}>{editing.id ? "Save changes" : "Create product"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
