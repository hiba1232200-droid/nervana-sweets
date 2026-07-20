"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

// Registers the service worker and surfaces a tasteful install prompt.
export default function RegisterSW() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gold/30 bg-ink-soft/95 px-4 py-3 shadow-cinematic backdrop-blur"
          role="dialog" aria-label="Install NERVANA app"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/40 font-display font-bold text-gold">N</span>
          <div className="text-sm">
            <p className="font-semibold text-cream">Install NERVANA</p>
            <p className="text-xs text-cream/50">Add to your home screen for a faster, app-like experience.</p>
          </div>
          <button onClick={install} className="btn-gold px-4 py-2 text-xs"><Download size={14} /> Install</button>
          <button onClick={() => setShow(false)} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded-lg text-cream/50 hover:bg-white/10"><X size={15} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
