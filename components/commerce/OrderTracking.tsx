"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Download, CheckCircle2, Package, ChefHat, Bike, Home, PartyPopper } from "lucide-react";
import { useApp, type Order } from "@/lib/stores/AppProvider";
import { downloadInvoice, orderQr } from "@/lib/invoice";
import { getProduct } from "@/lib/data/products";

const stages = [
  { icon: Clock, key: "pending" },
  { icon: ChefHat, key: "preparing" },
  { icon: Package, key: "ready" },
  { icon: Bike, key: "outForDelivery" },
  { icon: Home, key: "delivered" },
] as const;

export default function OrderTracking({ id }: { id: string }) {
  const { t, lang, orders, format, advanceOrder } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    const o = orders.find((x) => x.id === id) || null;
    setOrder(o);
    if (o) orderQr(o).then(setQr).catch(() => {});
  }, [orders, id]);

  // auto-advance the simulated status every few seconds
  useEffect(() => {
    if (!order || order.status >= 4) return;
    const timer = setTimeout(() => advanceOrder(order.id), 6000);
    return () => clearTimeout(timer);
  }, [order, advanceOrder]);

  if (!hydrated) return <div className="pt-40 text-center text-cream/50">…</div>;

  if (!order) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink pt-24 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">{t.order.orderNo}: {id}</h1>
          <p className="mt-2 text-cream/50">—</p>
          <Link href="/products" className="btn-gold mt-6">{t.cart.continue}</Link>
        </div>
      </div>
    );
  }

  const label = (k: (typeof stages)[number]["key"]) => t.order[k];

  return (
    <div className="min-h-screen bg-ink px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-4xl">
        {/* header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-3xl glass p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold text-ink">
            <PartyPopper size={30} />
          </div>
          <h1 className="font-display text-3xl font-bold text-gold-gradient">{t.order.thankYou}</h1>
          <p className="mt-1 text-cream/60">{t.order.thankYouDesc}</p>
          <p className="mt-3 inline-block rounded-full bg-white/5 px-4 py-1.5 text-sm text-cream">{t.order.orderNo}: <b className="text-gold">{order.id}</b></p>
        </motion.div>

        {/* progress */}
        <div className="rounded-3xl glass p-8">
          <h2 className="mb-8 font-display text-xl font-bold text-cream">{t.order.tracking}</h2>
          <div className="relative flex justify-between">
            <div className="absolute top-6 h-0.5 w-full bg-white/10 ltr:left-0 rtl:right-0" />
            <motion.div
              className="absolute top-6 h-0.5 bg-gold ltr:left-0 rtl:right-0"
              initial={{ width: 0 }}
              animate={{ width: `${(order.status / (stages.length - 1)) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
            {stages.map((s, i) => {
              const done = i <= order.status;
              const active = i === order.status;
              return (
                <div key={s.key} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    animate={active ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ repeat: active ? Infinity : 0, duration: 1.6 }}
                    className={`grid h-12 w-12 place-items-center rounded-full border-2 transition ${done ? "border-gold bg-gold text-ink" : "border-white/20 bg-ink text-cream/40"}`}
                  >
                    {i < order.status ? <CheckCircle2 size={22} /> : <s.icon size={20} />}
                  </motion.div>
                  <span className={`text-center text-[11px] font-semibold md:text-xs ${done ? "text-gold" : "text-cream/40"}`}>{label(s.key)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            <Clock size={16} /> {t.checkout.estimatedTime}
          </div>
        </div>

        {/* items + invoice + QR */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl glass p-6 md:col-span-2">
            <h3 className="mb-4 font-display text-lg font-bold text-cream">{t.checkout.orderSummary}</h3>
            <ul className="divide-y divide-white/10">
              {order.items.map((it) => {
                const p = getProduct(it.id);
                return (
                  <li key={it.id} className="flex items-center gap-3 py-3">
                    {p && <div className="relative h-14 w-14 overflow-hidden rounded-xl"><Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" /></div>}
                    <div className="flex-1">
                      <p className="text-sm text-cream">{lang === "ar" ? it.name : it.nameEn}</p>
                      <p className="text-xs text-cream/50">×{it.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-gold">{format(it.price * it.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-display text-lg font-bold text-cream">{t.cart.total}</span>
              <span className="font-display text-2xl font-bold text-gold">{format(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-3xl glass p-6 text-center">
            <h3 className="font-display text-lg font-bold text-cream">{t.order.qr}</h3>
            {qr ? <Image src={qr} alt="Order QR" width={150} height={150} className="rounded-2xl bg-white p-2" /> : <div className="h-[150px] w-[150px] animate-pulse rounded-2xl bg-white/10" />}
            <button onClick={() => downloadInvoice(order, lang)} className="btn-gold w-full text-sm">
              <Download size={16} /> {t.order.invoice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
