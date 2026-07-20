"use client";

import { useApp } from "@/lib/stores/AppProvider";
import { getProduct } from "@/lib/data/products";
import ProductShowcase from "./ProductShowcase";

export default function RecentlyViewed() {
  const { t, recentlyViewed } = useApp();
  const items = recentlyViewed.map(getProduct).filter(Boolean) as any[];
  if (items.length === 0) return null;
  return <ProductShowcase id="recent" sub={t.brandSub} title={t.product.recentlyViewed} items={items} tone="soft" />;
}
