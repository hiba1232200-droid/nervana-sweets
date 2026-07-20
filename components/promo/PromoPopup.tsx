"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Gift } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import Countdown from "./Countdown";
import Confetti from "@/components/ui/Confetti";

export default function PromoPopup() {
  const { lang, activePromos, claimPromo, claimedPromos, updatePromo, format } = useApp();
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  const promo = activePromos.find((p) => p.placements.includes("popup"));

  useEffect(() => {
    if (!promo) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem(`nv_promo_pop_${promo.id}`) === "1"; } catch {}
    if (dismissed) return;
    const t = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(t);
  }, [promo?.id]);

  if (!promo) return null;
  const labels = lang === "ar" ? { d: "يوم", h: "ساعة", m: "دقيقة", s: "ثانية" } : { d: "Days", h: "Hrs", m: "Min", s: "Sec" };

  const dismiss = () => { try { localStorage.setItem(`nv_promo_pop_${promo.id}`, "1"); } catch {} setOpen(false); };
  const claim = () => {
    const code = claimPromo(promo.id);
    setClaimedCode(code);
    setConfetti((n) => n + 1);
    setTimeout(dismiss, 2600);
  };
  const claimed = claimedPromos.includes(promo.id) || claimedCode !== null;

  return (
    <>
      <Confetti trigger={confetti} />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={dismiss}
            className="fixed inset-0 z-[190] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}
              className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center"
            >
              <button onClick={dismiss} aria-label="Close" className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full glass-light"><X size={16} /></button>
              <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold"><Sparkles size={26} /></span>
              <span className="mb-2 inline-block rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">-{promo.discountPercent}%</span>
              <h3 className="font-display text-3xl font-bold text-gold-gradient">{lang === "ar" ? promo.title : promo.titleEn}</h3>
              <p className="mt-2 text-sm text-cream/60">{lang === "ar" ? "لفترة محدودة — سارع قبل انتهاء العرض!" : "Limited time — hurry before it ends!"}</p>

              <div className="my-5 flex justify-center"><Countdown endsAt={promo.endsAt} labels={labels} onExpire={() => updatePromo(promo.id, { active: false })} /></div>

              <div className="mb-5 flex justify-center gap-2">
                {promo.productIds.map(getProduct).filter(Boolean).slice(0, 4).map((p: any) => (
                  <div key={p.id} className="relative h-12 w-12 overflow-hidden rounded-xl border border-gold/20">
                    <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                ))}
              </div>

              {claimed ? (
                <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-300">
                  <p className="font-semibold">{lang === "ar" ? "تم تفعيل العرض! 🎉" : "Promotion claimed! 🎉"}</p>
                  {claimedCode && <p className="mt-1 text-sm">{lang === "ar" ? "الكود:" : "Code:"} <b className="text-gold">{claimedCode}</b></p>}
                </div>
              ) : (
                <button onClick={claim} className="btn-gold w-full"><Gift size={18} /> {lang === "ar" ? "احصل على العرض" : "Claim offer"}</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
