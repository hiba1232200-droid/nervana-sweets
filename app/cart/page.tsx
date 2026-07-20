"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, Tag, Gift, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";

export default function CartPage() {
  const {
    t, lang, cart, setQty, removeFromCart, cartSubtotal, format,
    coupon, applyCoupon, useLoyalty, setUseLoyalty, user, deliveryFee, settings,
  } = useApp();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const couponDiscount = coupon ? cartSubtotal * (coupon.percent / 100) : 0;
  const loyaltyValue = user && useLoyalty ? Math.min(user.loyalty / 100, cartSubtotal * 0.2) : 0;
  const freeDelivery = cartSubtotal >= settings.freeDeliveryOver;
  const delivery = cart.length > 0 && !freeDelivery ? deliveryFee : 0;
  const total = Math.max(0, cartSubtotal - couponDiscount - loyaltyValue + delivery);

  if (cart.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink pt-24">
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full glass text-gold"><ShoppingBag size={40} /></div>
          <h1 className="font-display text-3xl font-bold text-cream">{t.cart.empty}</h1>
          <p className="mt-2 text-cream/50">{t.cart.emptyDesc}</p>
          <Link href="/products" className="btn-gold mt-6">{t.cart.continue}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 font-display text-4xl font-bold text-gold-gradient">{t.cart.title}</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => {
              const p = getProduct(item.id);
              if (!p) return null;
              const name = lang === "ar" ? p.name : p.nameEn;
              return (
                <div key={item.id} className="flex gap-4 rounded-3xl glass p-4">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={p.images[0]} alt={name} fill className="object-cover" sizes="112px" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/products/${p.id}`} className="font-display text-lg font-semibold text-cream hover:text-gold">{name}</Link>
                        <p className="text-xs text-cream/50">{p.weight}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-white/40 hover:text-rose-400"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gold hover:text-ink"><Minus size={14} /></button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gold hover:text-ink"><Plus size={14} /></button>
                      </div>
                      <span className="font-display text-lg font-bold text-gold">{format(discountedPrice(p) * item.qty)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gold hover:gap-3"><Arrow size={16} /> {t.cart.continue}</Link>
          </div>

          {/* Summary */}
          <div className="h-fit space-y-4 rounded-3xl glass p-6 lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-bold text-cream">{t.checkout.orderSummary}</h3>

            {/* coupon */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-cream/70"><Tag size={14} className="text-gold" /> {t.cart.coupon}</label>
              <div className="flex gap-2">
                <input value={code} onChange={(e) => { setCode(e.target.value); setErr(false); }} placeholder="NERVANA10" className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream outline-none focus:border-gold" />
                <button onClick={() => { if (!applyCoupon(code)) setErr(true); }} className="btn-gold px-5 py-2 text-sm">{t.cart.apply}</button>
              </div>
              {coupon && <p className="mt-1 text-xs text-emerald-400">✓ {coupon.code} (-{coupon.percent}%)</p>}
              {err && <p className="mt-1 text-xs text-rose-400">✕</p>}
            </div>

            {/* loyalty */}
            {user && (
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/[0.03] p-3 text-sm">
                <span className="flex items-center gap-2 text-cream/80"><Gift size={15} className="text-gold" /> {t.cart.loyalty}</span>
                <input type="checkbox" checked={useLoyalty} onChange={(e) => setUseLoyalty(e.target.checked)} className="h-4 w-4 accent-gold" />
              </label>
            )}

            <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
              <Row label={t.cart.subtotal} value={format(cartSubtotal)} />
              {couponDiscount > 0 && <Row label={t.cart.discount} value={`- ${format(couponDiscount)}`} accent="text-emerald-400" />}
              {loyaltyValue > 0 && <Row label={t.cart.loyalty} value={`- ${format(loyaltyValue)}`} accent="text-emerald-400" />}
              <Row label={t.cart.delivery} value={format(delivery)} />
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-display text-lg font-bold text-cream">{t.cart.total}</span>
                <span className="font-display text-2xl font-bold text-gold">{format(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-gold w-full">{t.cart.checkout} <Arrow size={16} /></Link>
            <p className="text-center text-xs text-gold">{t.checkout.estimatedTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between text-cream/70">
      <span>{label}</span>
      <span className={accent || "text-cream"}>{value}</span>
    </div>
  );
}
