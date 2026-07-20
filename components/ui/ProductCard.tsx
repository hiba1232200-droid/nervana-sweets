"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Scale, Eye } from "lucide-react";
import { type Product, discountedPrice } from "@/lib/data/products";
import { useApp } from "@/lib/stores/AppProvider";
import Stars from "./Stars";
import clsx from "clsx";

const badgeStyles: Record<string, string> = {
  new: "bg-emerald-500/90 text-white",
  bestSeller: "bg-gold text-ink",
  limited: "bg-rose-600/90 text-white",
  discount: "bg-white text-ink",
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { t, lang, format, addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useApp();
  const name = lang === "ar" ? product.name : product.nameEn;
  const price = discountedPrice(product);
  const inWish = wishlist.includes(product.id);
  const inCompare = compare.includes(product.id);
  const stockLabel =
    product.stock === 0 ? t.product.outStock : product.stock <= 5 ? t.product.lowStock : t.product.inStock;
  const stockColor =
    product.stock === 0 ? "text-rose-400" : product.stock <= 5 ? "text-amber-400" : "text-emerald-400";

  const badgeLabel = (b: string) =>
    b === "new" ? t.product.new
    : b === "bestSeller" ? t.product.bestSeller
    : b === "limited" ? t.product.limited
    : `${product.discount}% ${t.product.off}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card-luxury group"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images[0]}
            alt={name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent opacity-70" />
        </Link>

        {/* badges */}
        <div className="absolute top-3 z-10 flex flex-col gap-1.5 ltr:left-3 rtl:right-3">
          {product.badges.map((b) => (
            <span
              key={b}
              className={clsx(
                "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-md",
                badgeStyles[b]
              )}
            >
              {badgeLabel(b)}
            </span>
          ))}
        </div>

        {/* quick actions */}
        <div className="absolute top-3 z-10 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 ltr:right-3 rtl:left-3">
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={t.product.addToWishlist}
            className={clsx(
              "grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-110",
              inWish && "text-rose-400"
            )}
          >
            <Heart size={16} className={inWish ? "fill-rose-400" : ""} />
          </button>
          <button
            onClick={() => toggleCompare(product.id)}
            aria-label={t.product.compare}
            className={clsx(
              "grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-110",
              inCompare && "text-gold"
            )}
          >
            <Scale size={16} />
          </button>
          <Link
            href={`/products/${product.id}`}
            aria-label={t.product.quickView}
            className="grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-110"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className={stockColor}>● {stockLabel}</span>
          <span className="flex items-center gap-1 text-white/60">
            <Stars value={product.rating} size={12} /> {product.rating}
          </span>
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 font-display text-lg font-semibold text-cream transition group-hover:text-gold">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gold">{format(price)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-white/40 line-through">{format(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock === 0}
            aria-label={t.product.addToCart}
            className="grid h-10 w-10 place-items-center rounded-full bg-gold text-ink transition hover:shadow-gold-glow disabled:opacity-40"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
