"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import SectionTitle from "../ui/SectionTitle";

export default function Contact() {
  const { t, lang } = useApp();
  const [sent, setSent] = useState(false);

  const info = [
    { icon: MapPin, ar: "المتجر الرئيسي، دمشق، سوريا", en: "Main Store, Damascus, Syria" },
    { icon: Phone, ar: "+963 900 000 000", en: "+963 900 000 000" },
    { icon: Mail, ar: "hello@nervana.sweets", en: "hello@nervana.sweets" },
    { icon: Clock, ar: "يومياً 9 صباحاً - 12 منتصف الليل", en: "Daily 9 AM - 12 AM" },
  ];

  return (
    <section className="section-pad bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub={t.sections.contactSub} title={t.sections.contact} />
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: info + form */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {info.map((c) => (
                <div key={c.en} className="flex items-center gap-3 rounded-2xl glass p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><c.icon size={19} /></span>
                  <span className="text-sm text-cream/90">{lang === "ar" ? c.ar : c.en}</span>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3 rounded-3xl glass p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder={t.checkout.fullName} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
                <input required placeholder={t.checkout.phone} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
              </div>
              <textarea required rows={4} placeholder={t.checkout.notes} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream outline-none focus:border-gold" />
              <button type="submit" className="btn-gold w-full">
                {sent ? "✓" : <>{t.common.send} <Send size={15} /></>}
              </button>
            </form>
          </motion.div>

          {/* Right: Google Map */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="overflow-hidden rounded-3xl border border-gold/20 min-h-[420px]">
            <iframe
              title="NERVANA Location"
              src="https://www.google.com/maps?q=Damascus,Syria&output=embed"
              className="h-full min-h-[420px] w-full grayscale-[0.3]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
