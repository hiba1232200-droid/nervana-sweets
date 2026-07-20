"use client";

import { useApp } from "@/lib/stores/AppProvider";
import { products } from "@/lib/data/products";
import Hero from "@/components/home/Hero";
import PromoSection from "@/components/home/PromoSection";
import Categories from "@/components/home/Categories";
import ProductShowcase from "@/components/home/ProductShowcase";
import Seasonal from "@/components/home/Seasonal";
import Offers from "@/components/home/Offers";
import Gallery from "@/components/home/Gallery";
import Instagram from "@/components/home/Instagram";
import About from "@/components/home/About";
import Reviews from "@/components/home/Reviews";
import FAQ from "@/components/home/FAQ";
import Contact from "@/components/home/Contact";
import RecentlyViewed from "@/components/home/RecentlyViewed";

export default function HomePage() {
  const { t } = useApp();
  return (
    <>
      <Hero />
      <PromoSection />
      <Categories />
      <ProductShowcase id="featured" sub={t.sections.featuredSub} title={t.sections.featured} items={products.filter((p) => p.featured)} tone="soft" />
      <ProductShowcase id="best" sub={t.sections.bestSellersSub} title={t.sections.bestSellers} items={products.filter((p) => p.bestSeller)} />
      <Seasonal />
      <ProductShowcase id="new" sub={t.sections.newArrivalsSub} title={t.sections.newArrivals} items={products.filter((p) => p.isNew)} tone="soft" />
      <Offers />
      <Gallery />
      <Instagram />
      <About />
      <Reviews />
      <RecentlyViewed />
      <FAQ />
      <Contact />
    </>
  );
}
