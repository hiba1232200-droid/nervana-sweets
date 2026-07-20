"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const TOPICS = [
  { key: "offers", label: { ar: "عروض جديدة", en: "New offers" } },
  { key: "discounts", label: { ar: "حملات الخصم", en: "Discount campaigns" } },
  { key: "products", label: { ar: "منتجات جديدة", en: "New products" } },
  { key: "orders", label: { ar: "تحديثات الطلب", en: "Order updates" } },
];

export default function PushOptIn({ lang = "ar" }: { lang?: "ar" | "en" }) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [topics, setTopics] = useState<string[]>(["offers", "discounts", "products", "orders"]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
    navigator.serviceWorker?.ready.then((reg) => reg.pushManager.getSubscription()).then((s) => setSubscribed(!!s)).catch(() => {});
  }, []);

  const subscribe = async () => {
    setBusy(true);
    try {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const perm = await Notification.requestPermission();
      if (perm !== "granted" || !key) { setBusy(false); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), topics }) }).catch(() => {});
      setSubscribed(true);
    } catch { /* ignore */ }
    setBusy(false);
  };

  if (!supported) return null;

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold"><Bell size={18} /></span>
        <div>
          <p className="font-semibold text-cream">{lang === "ar" ? "إشعارات الويب" : "Web Push Notifications"}</p>
          <p className="text-xs text-cream/50">{lang === "ar" ? "كن أول من يعرف بالعروض والمنتجات وتحديثات الطلب." : "Be first to know about offers, products and order updates."}</p>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {TOPICS.map((tpc) => {
          const on = topics.includes(tpc.key);
          return (
            <button key={tpc.key} onClick={() => setTopics((s) => (on ? s.filter((x) => x !== tpc.key) : [...s, tpc.key]))}
              className={`rounded-full px-3 py-1 text-xs ${on ? "bg-gold text-ink" : "bg-white/5 text-cream/60"}`}>
              {on && <Check size={11} className="mr-1 inline" />}{tpc.label[lang]}
            </button>
          );
        })}
      </div>
      {subscribed ? (
        <p className="flex items-center gap-2 text-sm text-emerald-400"><Check size={15} /> {lang === "ar" ? "مُفعّلة" : "Enabled"}</p>
      ) : (
        <button onClick={subscribe} disabled={busy} className="btn-gold px-5 py-2 text-sm disabled:opacity-50">
          <BellOff size={14} /> {busy ? "…" : lang === "ar" ? "تفعيل الإشعارات" : "Enable notifications"}
        </button>
      )}
    </div>
  );
}
