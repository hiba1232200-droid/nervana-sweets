"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Phone } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";

export default function AuthModal() {
  const { t, ui, closeUi, login } = useApp();
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const done = (method: "email" | "google" | "phone") => {
    login({ method, name, email, phone });
    closeUi("auth");
  };

  return (
    <AnimatePresence>
      {ui.auth && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => closeUi("auth")}
          className="fixed inset-0 z-[95] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-8"
          >
            <button onClick={() => closeUi("auth")} className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full glass-light"><X size={16} /></button>
            <div className="mb-6 text-center">
              <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border border-gold/50 font-display text-2xl font-bold text-gold">N</span>
              <h3 className="font-display text-2xl font-bold text-gold-gradient">{t.account.login}</h3>
              <p className="mt-1 text-sm text-white/50">{t.brandSub}</p>
            </div>

            <button onClick={() => done("google")} className="mb-3 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 py-3 font-semibold text-cream transition hover:bg-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.6 14.7 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z"/></svg>
              {t.account.withGoogle}
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-white/30">
              <span className="h-px flex-1 bg-white/10" /> {t.account.register} <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mb-4 flex rounded-full bg-white/5 p-1">
              <button onClick={() => setTab("email")} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm ${tab === "email" ? "bg-gold text-ink" : "text-cream/70"}`}><Mail size={15} /> {t.checkout.contactInfo}</button>
              <button onClick={() => setTab("phone")} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm ${tab === "phone" ? "bg-gold text-ink" : "text-cream/70"}`}><Phone size={15} /> {t.checkout.phone}</button>
            </div>

            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.checkout.fullName} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
              {tab === "email" ? (
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
              ) : (
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+963 9xx xxx xxx" type="tel" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
              )}
              <button onClick={() => done(tab)} className="btn-gold w-full">
                {tab === "email" ? t.account.withEmail : t.account.withPhone}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
