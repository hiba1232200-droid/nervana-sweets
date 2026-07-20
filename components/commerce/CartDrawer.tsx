"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import Drawer from "./Drawer";

export default function CartDrawer() {
  const { t, lang, ui, closeUi, cart, setQty, removeFromCart, cartSubtotal, format } = useApp();

  return (
    <Drawer
      open={ui.cart}
      onClose={() => closeUi("cart")}
      title={t.cart.title}
      footer={
        cart.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-cream">
              <span className="text-white/70">{t.cart.subtotal}</span>
              <span className="text-xl font-bold text-gold">{format(cartSubtotal)}</span>
            </div>
            <Link href="/checkout" onClick={() => closeUi("cart")} className="btn-gold w-full">
              {t.cart.checkout}
            </Link>
            <button onClick={() => closeUi("cart")} className="w-full text-center text-sm text-white/60 hover:text-gold">
              {t.cart.continue}
            </button>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full glass-light text-gold"><ShoppingBag size={30} /></div>
          <p className="font-display text-xl text-cream">{t.cart.empty}</p>
          <p className="text-sm text-white/50">{t.cart.emptyDesc}</p>
          <button onClick={() => closeUi("cart")} className="btn-outline-gold mt-2">{t.cart.continue}</button>
        </div>
      ) : (
        <ul className="space-y-4">
          {cart.map((item) => {
            const p = getProduct(item.id);
            if (!p) return null;
            const name = lang === "ar" ? p.name : p.nameEn;
            return (
              <li key={item.id} className="flex gap-3 rounded-2xl bg-white/[0.03] p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.images[0]} alt={name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${p.id}`} onClick={() => closeUi("cart")} className="line-clamp-1 text-sm font-semibold text-cream hover:text-gold">{name}</Link>
                    <button onClick={() => removeFromCart(item.id)} className="text-white/40 hover:text-rose-400"><Trash2 size={15} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
                      <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-gold hover:text-ink"><Minus size={12} /></button>
                      <span className="w-5 text-center text-sm">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-gold hover:text-ink"><Plus size={12} /></button>
                    </div>
                    <span className="text-sm font-bold text-gold">{format(discountedPrice(p) * item.qty)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
