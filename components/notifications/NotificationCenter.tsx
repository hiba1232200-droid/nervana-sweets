"use client";

import Link from "next/link";
import { CheckCheck, Trash2, Bell, Package, CreditCard, Tag, Sparkles, Gift, Star, Ticket, Cake, Zap, Info } from "lucide-react";
import { useApp, type NotifKind } from "@/lib/stores/AppProvider";
import Drawer from "@/components/commerce/Drawer";

const ICON: Record<NotifKind, any> = {
  order: Package, payment: CreditCard, discount: Tag, product: Sparkles, seasonal: Gift,
  loyalty: Star, coupon: Ticket, birthday: Cake, restock: Bell, flash: Zap, system: Info,
};

function ago(at: number, lang: "ar" | "en") {
  const s = Math.max(1, Math.floor((Date.now() - at) / 1000));
  const units: [number, string, string][] = [
    [86400, "d", "يوم"], [3600, "h", "ساعة"], [60, "m", "دقيقة"], [1, "s", "ثانية"],
  ];
  for (const [sec, en, ar] of units) {
    if (s >= sec) { const n = Math.floor(s / sec); return lang === "ar" ? `منذ ${n} ${ar}` : `${n}${en} ago`; }
  }
  return lang === "ar" ? "الآن" : "now";
}

export default function NotificationCenter() {
  const { t, lang, ui, closeUi, notifications, markNotifRead, markAllNotifsRead, clearNotifs, unreadNotifs } = useApp();

  return (
    <Drawer
      open={ui.notifs}
      onClose={() => closeUi("notifs")}
      title={lang === "ar" ? "مركز الإشعارات" : "Notifications"}
      footer={
        notifications.length > 0 ? (
          <div className="flex gap-2">
            <button onClick={markAllNotifsRead} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 py-2 text-sm text-gold hover:bg-gold/10"><CheckCheck size={15} /> {lang === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}</button>
            <button onClick={clearNotifs} className="flex items-center justify-center gap-2 rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"><Trash2 size={15} /></button>
          </div>
        ) : null
      }
    >
      {notifications.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full glass-light text-gold"><Bell size={26} /></span>
          <p className="text-sm text-white/50">{lang === "ar" ? "لا توجد إشعارات بعد" : "No notifications yet"}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {unreadNotifs > 0 && <li className="px-1 text-xs uppercase tracking-wider text-gold/70">{unreadNotifs} {lang === "ar" ? "غير مقروء" : "unread"}</li>}
          {notifications.map((n) => {
            const Icon = ICON[n.kind] ?? Info;
            const inner = (
              <div className={`flex items-start gap-3 rounded-2xl p-3 transition ${n.read ? "bg-white/[0.02]" : "bg-gold/5"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5 text-gold"><Icon size={17} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-cream">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />}
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-cream/60">{n.body}</p>
                  <p className="mt-1 text-[11px] text-cream/35">{ago(n.at, lang)} · {new Date(n.at).toLocaleString(lang === "ar" ? "ar-SY" : "en-US")}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} onClick={() => { markNotifRead(n.id); closeUi("notifs"); }}>{inner}</Link>
                ) : (
                  <button onClick={() => markNotifRead(n.id)} className="w-full text-start">{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
