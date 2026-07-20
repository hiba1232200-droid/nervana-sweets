"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, Scale, Share2, Minus, Plus, ShoppingBag, Truck, Check,
  ShieldCheck, Leaf, ZoomIn,
} from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { products, discountedPrice, type Product } from "@/lib/data/products";
import Stars from "../ui/Stars";
import ProductShowcase from "../home/ProductShowcase";
import Countdown from "../promo/Countdown";

export default function ProductDetail({ product }: { product: Product }) {
  const { t, lang, format, addToCart, toggleWishlist, wishlist, toggleCompare, compare, addRecentlyViewed, activePromos, updatePromo } = useApp();
  const productPromo = activePromos.find((p) => p.placements.includes("product") && p.productIds.includes(product.id))
    ?? activePromos.find((p) => p.productIds.includes(product.id));
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ing" | "all">("desc");
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => { addRecentlyViewed(product.id); }, [product.id, addRecentlyViewed]);

  const name = lang === "ar" ? product.name : product.nameEn;
  const price = discountedPrice(product);
  const inWish = wishlist.includes(product.id);
  const inCompare = compare.includes(product.id);

  const similar = products.filter((p) => p.category === product.category && p.id !== product.id);
  const related = products.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, 4);

  const stockPct = Math.min(100, (product.stock / 40) * 100);
  const stockLabel = product.stock === 0 ? t.product.outStock : product.stock <= 5 ? t.product.lowStock : t.product.inStock;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) { try { await navigator.share({ title: name, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); } catch {} }
  };

  return (
    <div className="min-h-screen bg-ink pt-24">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        {/* breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-cream/50">
          <Link href="/" className="hover:text-gold">{t.nav.home}</Link><span>/</span>
          <Link href="/products" className="hover:text-gold">{t.nav.shop}</Link><span>/</span>
          <span className="text-gold">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-white/10"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
            >
              <Image
                src={product.images[activeImg]}
                alt={name}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-200"
                style={zoom ? { transform: "scale(2)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
                priority
              />
              <span className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-gold opacity-0 transition group-hover:opacity-100"><ZoomIn size={18} /></span>
              <div className="absolute start-4 top-4 flex flex-col gap-1.5">
                {product.badges.map((b) => (
                  <span key={b} className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold text-ink">
                    {b === "new" ? t.product.new : b === "bestSeller" ? t.product.bestSeller : b === "limited" ? t.product.limited : `${product.discount}% ${t.product.off}`}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${activeImg === i ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-4xl font-bold text-cream">{name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <Stars value={product.rating} size={18} />
              <span className="text-sm text-cream/60">{product.rating} · {product.ratingCount} {t.product.reviews}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-gold">{format(price)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-white/40 line-through">{format(product.price)}</span>
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">-{product.discount}%</span>
                </>
              )}
            </div>

            {/* limited-time promo countdown */}
            {productPromo && (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-rose-300">⚡ {lang === "ar" ? `عرض ${productPromo.discountPercent}% ينتهي خلال` : `${productPromo.discountPercent}% off ends in`}</p>
                  <p className="text-xs text-cream/50">{lang === "ar" ? productPromo.title : productPromo.titleEn}</p>
                </div>
                <Countdown
                  endsAt={productPromo.endsAt}
                  labels={lang === "ar" ? { d: "ي", h: "س", m: "د", s: "ث" } : { d: "D", h: "H", m: "M", s: "S" }}
                  onExpire={() => updatePromo(productPromo.id, { active: false })}
                />
              </div>
            )}

            {/* availability + stock bar */}
            <div className="mt-6 rounded-2xl bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className={product.stock === 0 ? "text-rose-400" : "text-emerald-400"}>● {stockLabel}</span>
                <span className="text-cream/60">{t.product.stockQty}: {product.stock}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light" style={{ width: `${stockPct}%` }} />
              </div>
            </div>

            {/* weight */}
            <div className="mt-4 flex gap-3 text-sm">
              <span className="rounded-full border border-white/10 px-4 py-1.5 text-cream/80">{t.product.weight}: <b className="text-gold">{product.weight}</b></span>
            </div>

            {/* qty + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/5 p-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-gold hover:text-ink"><Minus size={15} /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-gold hover:text-ink"><Plus size={15} /></button>
              </div>
              <button onClick={() => addToCart(product.id, qty)} disabled={product.stock === 0} className="btn-gold flex-1 disabled:opacity-40">
                <ShoppingBag size={18} /> {t.product.addToCart}
              </button>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={() => toggleWishlist(product.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-2.5 text-sm transition ${inWish ? "border-rose-400 text-rose-400" : "border-white/15 text-cream/80 hover:border-gold"}`}>
                <Heart size={16} className={inWish ? "fill-rose-400" : ""} /> {t.product.addToWishlist}
              </button>
              <button onClick={() => toggleCompare(product.id)} className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${inCompare ? "border-gold text-gold" : "border-white/15 text-cream/80 hover:border-gold"}`}>
                <Scale size={16} /> {t.product.compare}
              </button>
              <button onClick={share} className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-cream/80 transition hover:border-gold">
                <Share2 size={16} /> {t.product.share}
              </button>
            </div>

            {/* delivery */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
              <Truck className="text-gold" />
              <div>
                <p className="text-sm font-semibold text-cream">{t.product.delivery}</p>
                <p className="text-xs text-gold">{t.product.deliveryTime}</p>
              </div>
            </div>

            {/* trust badges */}
            <div className="mt-4 flex gap-4 text-xs text-cream/60">
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-gold" /> {lang === "ar" ? "دفع آمن" : "Secure Payment"}</span>
              <span className="flex items-center gap-1.5"><Leaf size={15} className="text-gold" /> {lang === "ar" ? "طبيعي 100%" : "100% Natural"}</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-gold" /> {lang === "ar" ? "طازج يومياً" : "Fresh Daily"}</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-2 border-b border-white/10">
            {([["desc", t.product.description], ["ing", t.product.ingredients], ["all", t.product.allergens]] as const).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className={`relative px-5 py-3 text-sm font-semibold transition ${tab === k ? "text-gold" : "text-cream/50 hover:text-cream"}`}>
                {label}
                {tab === k && <motion.span layoutId="tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>
          <div className="py-6 leading-relaxed text-cream/70">
            {tab === "desc" && <p>{lang === "ar" ? product.desc : product.descEn}</p>}
            {tab === "ing" && <p>{lang === "ar" ? product.ingredients : product.ingredientsEn}</p>}
            {tab === "all" && <p className="text-amber-300/90">⚠ {lang === "ar" ? product.allergens : product.allergensEn}</p>}
          </div>
        </div>

        {/* Reviews with images */}
        <div className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-bold text-gold-gradient">{t.product.reviews}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl glass p-5">
                <div className="flex items-center gap-3">
                  <Image src={r.avatar} alt={r.name} width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-cream">{lang === "ar" ? r.name : r.nameEn}</p>
                    <Stars value={r.rating} size={12} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{lang === "ar" ? r.text : r.textEn}</p>
                {r.image && (
                  <div className="relative mt-3 h-28 overflow-hidden rounded-xl">
                    <Image src={r.image} alt="review" fill sizes="300px" className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar + related */}
      <ProductShowcase sub={t.brandSub} title={t.product.similar} items={similar} tone="soft" />
      <ProductShowcase sub={t.common.recommended} title={t.product.related} items={related} />
    </div>
  );
}
