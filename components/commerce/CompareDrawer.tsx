"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import Drawer from "./Drawer";
import Stars from "../ui/Stars";

export default function CompareDrawer() {
  const { t, lang, ui, closeUi, compare, toggleCompare, clearCompare, format } = useApp();
  const items = compare.map(getProduct).filter(Boolean);

  const rows: { label: string; get: (p: any) => React.ReactNode }[] = [
    { label: t.product.price, get: (p) => format(discountedPrice(p)) },
    { label: t.product.weight, get: (p) => p.weight },
    { label: t.product.rating, get: (p) => <Stars value={p.rating} size={12} /> },
    { label: t.product.availability, get: (p) => (p.stock > 0 ? t.product.inStock : t.product.outStock) },
    { label: t.product.stockQty, get: (p) => p.stock },
    { label: t.product.allergens, get: (p) => (lang === "ar" ? p.allergens : p.allergensEn) },
  ];

  return (
    <Drawer
      open={ui.compare}
      onClose={() => closeUi("compare")}
      title={t.common.compare}
      footer={items.length > 0 ? <button onClick={clearCompare} className="btn-outline-gold w-full py-2 text-sm">{t.filters.clear}</button> : null}
    >
      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-white/50">{t.cart.emptyDesc}</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(120px,1fr))` }}>
            {items.map((p: any) => (
              <div key={p.id} className="relative rounded-2xl bg-white/[0.03] p-3">
                <button onClick={() => toggleCompare(p.id)} className="absolute end-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full glass-light"><X size={12} /></button>
                <div className="relative mb-2 aspect-square overflow-hidden rounded-xl">
                  <Image src={p.images[0]} alt="" fill className="object-cover" sizes="120px" />
                </div>
                <Link href={`/products/${p.id}`} onClick={() => closeUi("compare")} className="line-clamp-2 text-xs font-semibold text-cream hover:text-gold">
                  {lang === "ar" ? p.name : p.nameEn}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="rounded-xl bg-white/[0.02] p-2">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-gold/70">{r.label}</div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(120px,1fr))` }}>
                  {items.map((p: any) => (
                    <div key={p.id} className="text-xs text-cream/90">{r.get(p)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
