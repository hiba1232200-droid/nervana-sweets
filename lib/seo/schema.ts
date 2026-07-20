import type { Product } from "@/lib/data/products";
import { discountedPrice } from "@/lib/data/products";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nervana.sweets";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NERVANA Sweets",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description: "Luxury oriental sweets, delivered in 10–30 minutes.",
    sameAs: [
      "https://instagram.com/nervana",
      "https://facebook.com/nervana",
      "https://twitter.com/nervana",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+963-900-000-000",
      contactType: "customer service",
      areaServed: "SY",
      availableLanguage: ["ar", "en"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NERVANA Sweets",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(p: Product) {
  const price = discountedPrice(p).toFixed(2);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nameEn,
    image: p.images,
    description: p.descEn,
    sku: p.id,
    brand: { "@type": "Brand", name: "NERVANA Sweets" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.ratingCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${p.id}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.url}`,
    })),
  };
}
