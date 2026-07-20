"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import { localAssistant } from "@/lib/ai/assistant";
import { playSfx } from "@/lib/audio/sfx";

interface Msg { me: boolean; text: string; productIds?: string[] }

export default function Assistant() {
  const { t, lang, format, addToCart } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([{ me: false, text: lang === "ar"
      ? "أهلاً بك في نيرفانا! ✨ أنا مساعدك الذكي. اسألني عن الحلويات، الهدايا، المكوّنات، أو دعني أساعدك في طلبك."
      : "Welcome to NERVANA! ✨ I'm your smart assistant. Ask me about sweets, gifts, ingredients — or let me help you order." }]);
  }, [lang]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    playSfx("ai");
    setInput(""); setBusy(true);
    setMsgs((m) => [...m, { me: true, text: q }]);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, lang }) });
      const json = await res.json();
      const data = json?.data ?? localAssistant(q, lang);
      setMsgs((m) => [...m, { me: false, text: data.reply, productIds: data.productIds }]);
    } catch {
      const data = localAssistant(q, lang);
      setMsgs((m) => [...m, { me: false, text: data.reply, productIds: data.productIds }]);
    }
    setBusy(false);
  };

  const quick = lang === "ar"
    ? ["هدية زفاف 💍", "حلويات العيد", "لرمضان", "ضمن ميزانية 30$", "ما الأكثر مبيعاً؟", "المكوّنات", "كيف أطلب؟"]
    : ["Wedding gift 💍", "Eid sweets", "For Ramadan", "Budget under $30", "Best seller?", "Ingredients", "How do I order?"];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={lang === "ar" ? "المساعد الذكي" : "AI Assistant"}
        className="fixed bottom-24 z-[85] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-ink shadow-gold-glow-lg transition hover:scale-110 ltr:right-6 rtl:left-6"
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-40 z-[86] flex h-[30rem] w-[24rem] max-w-[90vw] flex-col overflow-hidden rounded-3xl ltr:right-6 rtl:left-6"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-gold/10 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-ink"><Sparkles size={20} /></span>
              <div>
                <p className="text-sm font-bold text-cream">{lang === "ar" ? "مساعد نيرفانا الذكي" : "NERVANA Assistant"}</p>
                <p className="flex items-center gap-1 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {lang === "ar" ? "متّصل" : "Online"}</p>
              </div>
            </div>

            <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i}>
                  <div className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                    <span className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.me ? "bg-gold text-ink" : "bg-white/8 text-cream"}`}>{m.text}</span>
                  </div>
                  {m.productIds && m.productIds.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.productIds.map(getProduct).filter(Boolean).map((p: any) => (
                        <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2">
                          <Link href={`/products/${p.id}`} className="relative h-11 w-11 overflow-hidden rounded-lg"><Image src={p.images[0]} alt={lang === "ar" ? p.name : p.nameEn} fill className="object-cover" sizes="44px" /></Link>
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${p.id}`} className="block truncate text-xs font-semibold text-cream hover:text-gold">{lang === "ar" ? p.name : p.nameEn}</Link>
                            <span className="text-xs font-bold text-gold">{format(discountedPrice(p))}</span>
                          </div>
                          <button onClick={() => addToCart(p.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-ink"><ShoppingBag size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="flex justify-start"><span className="rounded-2xl bg-white/8 px-3 py-2 text-sm text-cream/50">…</span></div>}
            </div>

            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {quick.map((q) => <button key={q} onClick={() => send(q)} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-cream/80 hover:border-gold hover:text-gold">{q}</button>)}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t.common.chatWithUs} className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm text-cream outline-none placeholder:text-white/40" />
              <button onClick={() => send()} disabled={busy} className="grid h-9 w-9 place-items-center rounded-full bg-gold text-ink disabled:opacity-50"><Send size={15} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
