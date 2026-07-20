"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/lib/stores/AppProvider";
import { seasonalCollections } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";

export default function Seasonal() {
  const { t, lang } = useApp();
  return (
    <section id="seasonal" className="section-pad relative overflow-hidden bg-ink-soft">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub={t.sections.seasonalSub} title={t.sections.seasonal} />
        <div className="grid gap-5 md:grid-cols-3">
          {seasonalCollections.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
            >
              <Link href={`/products?season=${c.id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl">
                <Image src={c.image} alt={lang === "ar" ? c.name : c.nameEn} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-[1200ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="mb-2 inline-block rounded-full bg-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">{t.sections.seasonal}</span>
                  <h3 className="font-display text-2xl font-bold text-cream transition group-hover:text-gold">{lang === "ar" ? c.name : c.nameEn}</h3>
                  <span className="mt-2 inline-block h-px w-0 bg-gold transition-all duration-500 group-hover:w-16" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
