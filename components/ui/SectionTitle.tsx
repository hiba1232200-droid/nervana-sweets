"use client";
import { motion } from "framer-motion";

export default function SectionTitle({
  sub,
  title,
  center = true,
}: {
  sub?: string;
  title: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-12 ${center ? "text-center" : ""}`}
    >
      {sub && (
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.35em] text-gold/80">
          {sub}
        </span>
      )}
      <h2 className="font-display text-4xl font-bold text-cream md:text-5xl">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      <div className={`mt-5 h-px w-24 bg-gold-line ${center ? "mx-auto" : ""}`} />
    </motion.div>
  );
}
