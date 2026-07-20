"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useApp } from "@/lib/stores/AppProvider";
import { galleryImages } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";

export default function Gallery() {
  const { t } = useApp();
  const spans = ["row-span-2", "", "", "row-span-2", "", "row-span-2", "", ""];
  return (
    <section id="gallery" className="section-pad bg-ink-soft">
      <div className="mx-auto max-w-7xl">
        <SectionTitle sub={t.sections.gallerySub} title={t.sections.gallery} />
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4">
          {galleryImages.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl ${spans[i % spans.length]}`}
            >
              <Image src={src} alt={`gallery ${i + 1}`} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/30" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full border border-gold/60 px-4 py-1 text-xs font-semibold text-gold backdrop-blur">NERVANA</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
