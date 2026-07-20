"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { type Product } from "@/lib/data/products";
import SectionTitle from "../ui/SectionTitle";
import ProductCard from "../ui/ProductCard";

export default function ProductShowcase({
  id, sub, title, items, tone = "dark",
}: {
  id?: string;
  sub: string;
  title: string;
  items: Product[];
  tone?: "dark" | "soft";
}) {
  const { t, lang } = useApp();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  if (items.length === 0) return null;
  return (
    <section id={id} className={`section-pad relative ${tone === "soft" ? "bg-ink-soft" : "bg-ink"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <SectionTitle sub={sub} title={title} center={false} />
          <Link href="/products" className="mb-12 hidden items-center gap-2 text-sm font-semibold text-gold transition-all hover:gap-3 md:flex">
            {t.product.viewAll} <Arrow size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
