"use client";

import { Suspense } from "react";
import ShopGrid from "@/components/commerce/ShopGrid";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-ink">
      <Suspense fallback={<div className="pt-40 text-center text-cream/50">…</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
