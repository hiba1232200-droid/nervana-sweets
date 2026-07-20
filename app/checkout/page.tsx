"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Check, User, Phone, MapPin, Home, Hash, StickyNote, Lock } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";

export default function CheckoutPage() {
  const { t, lang, cart, cartSubtotal, format, coupon, useLoyalty, user, placeOrder, deliveryFee, settings, storeOpen } = useApp();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState({ name: user?.name || "", phone: user?.phone || "", address: "", street: "", building: "", notes: "" });

  const couponDiscount = coupon ? cartSubtotal * (coupon.percent / 100) : 0;
  const loyaltyValue = user && useLoyalty ? Math.min(user.loyalty / 100, cartSubtotal * 0.2) : 0;
  const freeDelivery = cartSubtotal >= settings.freeDeliveryOver;
  const delivery = cart.length > 0 && !freeDelivery ? deliveryFee : 0;
  const total = Math.max(0, cartSubtotal - couponDiscount - loyaltyValue + delivery);
  const belowMin = cartSubtotal < settings.minOrder;
  const closedMsg = lang === "ar"
    ? "نحن مغلقون حالياً. ستُستأنف الطلبات خلال ساعات العمل."
    : "We are currently closed. Orders will resume during business hours.";

  if (cart.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink pt-24 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">{t.cart.empty}</h1>
          <Link href="/products" className="btn-gold mt-6">{t.cart.continue}</Link>
        </div>
      </div>
    );
  }

  const valid = f.name && f.phone && f.address && f.street;

  const confirm = () => {
    if (!storeOpen || belowMin) return;
    const order = placeOrder({
      total,
      subtotal: cartSubtotal,
      deliveryFee: delivery,
      discount: couponDiscount + loyaltyValue,
      coupon: coupon?.code ?? null,
      paymentMethod: "Cash on Delivery",
      items: cart.map((c) => {
        const p = getProduct(c.id)!;
        return { id: c.id, qty: c.qty, name: p.name, nameEn: p.nameEn, price: discountedPrice(p) };
      }),
      customer: f,
    });
    router.push(`/order/${order.id}`);
  };

  const fields: { key: keyof typeof f; label: string; icon: any; optional?: boolean; full?: boolean }[] = [
    { key: "name", label: t.checkout.fullName, icon: User },
    { key: "phone", label: t.checkout.phone, icon: Phone },
    { key: "address", label: t.checkout.address, icon: MapPin, full: true },
    { key: "street", label: t.checkout.street, icon: Home },
    { key: "building", label: t.checkout.building, icon: Hash, optional: true },
    { key: "notes", label: t.checkout.notes, icon: StickyNote, full: true },
  ];

  return (
    <div className="min-h-screen bg-ink px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 font-display text-4xl font-bold text-gold-gradient">{t.checkout.title}</h1>
        {/* steps */}
        <div className="mb-8 flex items-center gap-3 text-sm">
          {[t.checkout.contactInfo, t.checkout.review].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step >= i + 1 ? "bg-gold text-ink" : "bg-white/10 text-cream/50"}`}>{i + 1}</span>
              <span className={step >= i + 1 ? "text-gold" : "text-cream/50"}>{s}</span>
              {i === 0 && <span className="mx-2 h-px w-10 bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="space-y-4 rounded-3xl glass p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((fl) => (
                    <div key={fl.key} className={fl.full ? "sm:col-span-2" : ""}>
                      <label className="mb-1.5 flex items-center gap-2 text-sm text-cream/70">
                        <fl.icon size={14} className="text-gold" /> {fl.label}
                      </label>
                      {fl.key === "notes" ? (
                        <textarea rows={3} value={f[fl.key]} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
                      ) : (
                        <input value={f[fl.key]} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
                      )}
                    </div>
                  ))}
                </div>
                <button disabled={!valid} onClick={() => setStep(2)} className="btn-gold w-full disabled:opacity-40">{t.checkout.review}</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl glass p-6">
                  <h3 className="mb-3 font-display text-lg font-bold text-cream">{t.checkout.contactInfo}</h3>
                  <div className="grid gap-2 text-sm text-cream/70 sm:grid-cols-2">
                    <p><b className="text-cream">{f.name}</b></p>
                    <p>{f.phone}</p>
                    <p className="sm:col-span-2">{f.address}, {f.street} {f.building}</p>
                    {f.notes && <p className="sm:col-span-2 text-cream/50">“{f.notes}”</p>}
                  </div>
                  <button onClick={() => setStep(1)} className="mt-3 text-sm text-gold hover:underline">✎ {lang === "ar" ? "تعديل" : "Edit"}</button>
                </div>

                <div className="rounded-3xl glass p-6">
                  <h3 className="mb-3 font-display text-lg font-bold text-cream">{t.checkout.orderSummary}</h3>
                  <ul className="divide-y divide-white/10">
                    {cart.map((c) => {
                      const p = getProduct(c.id)!;
                      return (
                        <li key={c.id} className="flex items-center gap-3 py-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                            <Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-cream">{lang === "ar" ? p.name : p.nameEn}</p>
                            <p className="text-xs text-cream/50">×{c.qty}</p>
                          </div>
                          <span className="text-sm font-bold text-gold">{format(discountedPrice(p) * c.qty)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
                  <Clock className="text-gold" />
                  <p className="font-semibold text-gold">{t.checkout.estimatedTime}</p>
                </div>

                {!storeOpen && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
                    <Lock size={18} /> <span className="text-sm font-semibold">{closedMsg}</span>
                  </div>
                )}
                {storeOpen && belowMin && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                    {lang === "ar" ? `الحد الأدنى للطلب ${format(settings.minOrder)}` : `Minimum order is ${format(settings.minOrder)}`}
                  </div>
                )}
                <button onClick={confirm} disabled={!storeOpen || belowMin} className="btn-gold w-full text-lg disabled:opacity-40"><Check size={18} /> {t.checkout.placeOrder}</button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="h-fit space-y-3 rounded-3xl glass p-6 lg:sticky lg:top-28 text-sm">
            <h3 className="font-display text-lg font-bold text-cream">{t.checkout.orderSummary}</h3>
            <div className="flex justify-between text-cream/70"><span>{t.cart.subtotal}</span><span className="text-cream">{format(cartSubtotal)}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>{t.cart.discount}</span><span>- {format(couponDiscount)}</span></div>}
            {loyaltyValue > 0 && <div className="flex justify-between text-emerald-400"><span>{t.cart.loyalty}</span><span>- {format(loyaltyValue)}</span></div>}
            <div className="flex justify-between text-cream/70"><span>{t.cart.delivery}</span><span className="text-cream">{format(delivery)}</span></div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-display text-lg font-bold text-cream">{t.cart.total}</span>
              <span className="font-display text-2xl font-bold text-gold">{format(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
