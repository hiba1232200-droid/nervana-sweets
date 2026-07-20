"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { products, categories, discountedPrice } from "@/lib/data/products";
import ProductCard from "../ui/ProductCard";

type Sort = "new" | "priceLow" | "priceHigh" | "rating";

export default function ShopGrid() {
  const { t, lang } = useApp();
  const params = useSearchParams();
  const initialCat = params.get("category") || "all";
  const season = params.get("season");

  const [cat, setCat] = useState(initialCat);
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("new");
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (season && p.seasonal !== season) return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (discountedPrice(p) > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (inStockOnly && p.stock === 0) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "priceLow") return discountedPrice(a) - discountedPrice(b);
      if (sort === "priceHigh") return discountedPrice(b) - discountedPrice(a);
      if (sort === "rating") return b.rating - a.rating;
      return Number(b.isNew) - Number(a.isNew);
    });
    return out;
  }, [cat, maxPrice, minRating, inStockOnly, sort, season]);

  const clear = () => { setCat("all"); setMaxPrice(150); setMinRating(0); setInStockOnly(false); setSort("new"); };

  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t.filters.category}</h4>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat("all")} className={`rounded-full px-3 py-1.5 text-sm transition ${cat === "all" ? "bg-gold text-ink" : "bg-white/5 text-cream/70 hover:bg-white/10"}`}>{t.filters.all}</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full px-3 py-1.5 text-sm transition ${cat === c.id ? "bg-gold text-ink" : "bg-white/5 text-cream/70 hover:bg-white/10"}`}>
              {lang === "ar" ? c.name : c.nameEn}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t.filters.price}</h4>
        <input type="range" min={10} max={150} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-gold" />
        <div className="mt-1 flex justify-between text-xs text-cream/60"><span>$10</span><span className="text-gold">${maxPrice}</span></div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t.filters.rating}</h4>
        <div className="flex gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-full px-3 py-1.5 text-xs transition ${minRating === r ? "bg-gold text-ink" : "bg-white/5 text-cream/70"}`}>
              {r === 0 ? t.filters.all : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-gold" />
        {t.product.inStock}
      </label>
      <button onClick={clear} className="btn-outline-gold w-full py-2 text-sm">{t.filters.clear}</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gold-gradient">{t.nav.shop}</h1>
          <p className="mt-1 text-sm text-cream/50">{list.length} {t.filters.results}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-white/10 bg-ink px-4 py-2 text-sm text-cream outline-none">
            <option value="new">{t.filters.sortNew}</option>
            <option value="priceLow">{t.filters.sortPriceLow}</option>
            <option value="priceHigh">{t.filters.sortPriceHigh}</option>
            <option value="rating">{t.filters.sortRating}</option>
          </select>
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold lg:hidden">
            <SlidersHorizontal size={15} /> {t.filters.title}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-3xl glass p-6">{FiltersPanel}</div>
        </aside>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          {list.length === 0 && <p className="py-20 text-center text-cream/50">{t.filters.clear}</p>}
        </div>
      </div>

      {/* Mobile filters */}
      {showFilters && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowFilters(false)} />
          <div className="glass absolute bottom-0 max-h-[80vh] w-full overflow-y-auto rounded-t-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-gold">{t.filters.title}</h3>
              <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-full glass-light"><X size={18} /></button>
            </div>
            {FiltersPanel}
          </div>
        </div>
      )}
    </div>
  );
}
