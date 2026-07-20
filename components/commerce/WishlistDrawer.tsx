"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { getProduct, discountedPrice } from "@/lib/data/products";
import Drawer from "./Drawer";

export default function WishlistDrawer() {
  const { t, lang, ui, closeUi, wishlist, toggleWishlist, addToCart, format } = useApp();
  return (
    <Drawer open={ui.wishlist} onClose={() => closeUi("wishlist")} title={t.common.wishlist}>
      {wishlist.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full glass-light text-rose-400"><Heart size={30} /></div>
          <p className="text-sm text-white/50">{t.cart.emptyDesc}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {wishlist.map((id) => {
            const p = getProduct(id);
            if (!p) return null;
            const name = lang === "ar" ? p.name : p.nameEn;
            return (
              <li key={id} className="flex gap-3 rounded-2xl bg-white/[0.03] p-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.images[0]} alt={name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <Link href={`/products/${p.id}`} onClick={() => closeUi("wishlist")} className="line-clamp-1 text-sm font-semibold text-cream hover:text-gold">{name}</Link>
                    <button onClick={() => toggleWishlist(id)} className="text-white/40 hover:text-rose-400"><Trash2 size={15} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gold">{format(discountedPrice(p))}</span>
                    <button onClick={() => addToCart(id)} className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">
                      <ShoppingBag size={13} /> {t.product.addToCart}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
