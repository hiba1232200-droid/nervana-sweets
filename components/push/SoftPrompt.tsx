"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { pushSupported, subscribePush } from "@/lib/push/client";

const KEY = "nv_push_prompt";

// Politely asks for notification permission after the visitor has spent a
// short time on the site (or right after they sign in).
export default function SoftPrompt() {
  const { lang, user, notifTopics, notify } = useApp();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    if (Notification.permission !== "default") return;
    let done = false;
    try { done = localStorage.getItem(KEY) === "dismissed"; } catch {}
    if (done) return;
    // Sooner if the visitor just created an account / is logged in.
    const delay = user ? 3000 : 15000;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [user]);

  const dismiss = () => { try { localStorage.setItem(KEY, "dismissed"); } catch {} setShow(false); };

  const enable = async () => {
    setBusy(true);
    const okDone = await subscribePush(notifTopics.length ? notifTopics : ["orders", "discounts", "products", "offers"]);
    setBusy(false);
    try { localStorage.setItem(KEY, "dismissed"); } catch {}
    setShow(false);
    if (okDone) notify("system", lang === "ar" ? "تم تفعيل الإشعارات 🔔" : "Notifications enabled 🔔", lang === "ar" ? "سنبقيك على اطلاع بكل جديد." : "We'll keep you posted on everything new.");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          transition={{ ease: [0.22, 1, 0.36, 1] }}
          className="glass fixed bottom-24 left-1/2 z-[88] flex w-[26rem] max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-gold/30 p-4 shadow-cinematic sm:bottom-6"
          role="dialog" aria-label="Enable notifications"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Bell size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-cream">{lang === "ar" ? "ابقَ على اطلاع 🔔" : "Stay in the loop 🔔"}</p>
            <p className="text-xs text-cream/55">{lang === "ar" ? "فعّل الإشعارات لتصلك تحديثات الطلب والعروض الحصرية." : "Enable notifications for order updates and exclusive offers."}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button onClick={enable} disabled={busy} className="btn-gold px-4 py-1.5 text-xs disabled:opacity-50">{busy ? "…" : lang === "ar" ? "تفعيل" : "Enable"}</button>
            <button onClick={dismiss} className="text-[11px] text-cream/40 hover:text-cream/70">{lang === "ar" ? "لاحقاً" : "Not now"}</button>
          </div>
          <button onClick={dismiss} aria-label="Close" className="absolute end-2 top-2 text-cream/30 hover:text-cream/60"><X size={14} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
