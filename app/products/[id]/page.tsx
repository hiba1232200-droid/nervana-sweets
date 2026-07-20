import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProduct, discountedPrice } from "@/lib/data/products";
import ProductDetail from "@/components/product/ProductDetail";
import JsonLd from "@/components/seo/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

// Dynamic, SEO-friendly meta tags per product.
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = getProduct(params.id);
  if (!p) return { title: "Product not found" };
  const price = discountedPrice(p).toFixed(2);
  const title = p.nameEn;
  const description = `${p.descEn.slice(0, 155)}`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.id}` },
    openGraph: {
      type: "website",
      title: `${title} — $${price}`,
      description,
      images: p.images.map((url) => ({ url, alt: `${p.nameEn} — NERVANA Sweets` })),
    },
    twitter: { card: "summary_large_image", title, description, images: [p.images[0]] },
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) notFound();
  return (
    <>
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/products" },
            { name: product.nameEn, url: `/products/${product.id}` },
          ]),
        ]}
      />
      <ProductDetail product={product} />
    </>
  );
}
