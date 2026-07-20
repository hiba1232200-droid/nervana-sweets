"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { testimonials } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";
import Stars from "../ui/Stars";

export default function Reviews() {
  const { t, lang } = useApp();
  return (
    <section id="reviews" className="section-pad relative overflow-hidden bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub={t.sections.reviewsSub} title={t.sections.reviews} />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative rounded-3xl glass p-6"
            >
              <Quote className="absolute end-6 top-6 text-gold/20" size={40} />
              <Stars value={r.rating} />
              <p className="mt-4 leading-relaxed text-cream/80">“{lang === "ar" ? r.text : r.textEn}”</p>
              {r.image && (
                <div className="relative mt-4 h-32 overflow-hidden rounded-2xl">
                  <Image src={r.image} alt="review" fill sizes="300px" className="object-cover" />
                </div>
              )}
              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <Image src={r.avatar} alt={r.name} width={44} height={44} className="rounded-full" />
                <div>
                  <p className="text-sm font-bold text-cream">{lang === "ar" ? r.name : r.nameEn}</p>
                  <p className="text-xs text-cream/50">{new Date(r.date).toLocaleDateString(lang === "ar" ? "ar-SY" : "en-US")}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
