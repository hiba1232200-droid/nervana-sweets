"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { faqs } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";

export default function FAQ() {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section-pad bg-ink-soft">
      <div className="mx-auto max-w-3xl">
        <SectionTitle sub={t.sections.faqSub} title={t.sections.faq} />
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`overflow-hidden rounded-2xl border transition ${isOpen ? "border-gold/40 bg-gold/5" : "border-white/10 bg-white/[0.02]"}`}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-start">
                  <span className="font-display text-lg font-semibold text-cream">{lang === "ar" ? f.q : f.qEn}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <Plus size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className="px-5 pb-5 leading-relaxed text-cream/70">{lang === "ar" ? f.a : f.aEn}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
