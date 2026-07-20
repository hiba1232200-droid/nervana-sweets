"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram as IgIcon, Heart, MessageCircle } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { galleryImages } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";

export default function Instagram() {
  const { lang } = useApp();
  return (
    <section className="section-pad bg-ink">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub="@nervana.sweets" title={lang === "ar" ? "تابعنا على إنستغرام" : "Follow us on Instagram"} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((src, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/nervana"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image src={src} alt={`NERVANA on Instagram ${i + 1}`} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 grid place-items-center bg-ink/0 transition group-hover:bg-ink/60">
                <div className="flex items-center gap-4 text-cream opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-1 text-sm"><Heart size={16} className="fill-gold text-gold" /> {120 + i * 37}</span>
                  <span className="flex items-center gap-1 text-sm"><MessageCircle size={16} className="text-gold" /> {8 + i}</span>
                </div>
              </div>
              <IgIcon size={16} className="absolute end-2 top-2 text-cream/70 opacity-0 transition group-hover:opacity-100" />
            </motion.a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="https://instagram.com/nervana" target="_blank" rel="noreferrer" className="btn-outline-gold">
            <IgIcon size={17} /> @nervana.sweets
          </a>
        </div>
      </div>
    </section>
  );
}
