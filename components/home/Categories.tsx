"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { categories } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";

export default function Categories() {
  const { t, lang } = useApp();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <section id="categories" className="section-pad relative bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub={t.sections.categoriesSub} title={t.sections.categories} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
            >
              <Link href={`/products?category=${c.id}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/5">
                  <Image src={c.image} alt={lang === "ar" ? c.name : c.nameEn} fill sizes="200px" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-center">
                    <span className="font-display text-sm font-bold text-cream transition group-hover:text-gold md:text-base">
                      {lang === "ar" ? c.name : c.nameEn}
                    </span>
                    <span className="mt-0.5 text-[10px] text-cream/50">{c.count} {t.filters.results}</span>
                    <Arrow size={16} className="mt-1 text-gold opacity-0 transition group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
