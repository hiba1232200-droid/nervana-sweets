import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/stores/AppProvider";
import { AudioProvider } from "@/lib/audio/AudioProvider";
import AuthSession from "@/components/providers/AuthSession";
import Chrome from "@/components/Chrome";
import RegisterSW from "@/components/pwa/RegisterSW";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema, SITE_URL } from "@/lib/seo/schema";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "نيرفانا | حلويات شرقية فاخرة — NERVANA Sweets",
    template: "%s | NERVANA Sweets",
  },
  description:
    "نيرفانا للحلويات الشرقية الفاخرة — توصيل خلال 10 إلى 30 دقيقة. Luxury oriental sweets, delivered in 10–30 minutes.",
  keywords: ["حلويات شرقية", "بقلاوة", "كنافة", "معمول", "NERVANA", "oriental sweets", "luxury sweets", "Damascus"],
  applicationName: "NERVANA Sweets",
  authors: [{ name: "NERVANA Sweets" }],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/", languages: { "ar-SY": "/", "en-US": "/?lang=en" } },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "NERVANA Sweets",
    title: "NERVANA Sweets — Luxury Oriental Sweets",
    description: "Handcrafted oriental sweets with a golden touch. Delivered in 10–30 minutes.",
    url: SITE_URL,
    locale: "ar_SY",
    alternateLocale: ["en_US"],
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "NERVANA Sweets" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NERVANA Sweets — Luxury Oriental Sweets",
    description: "Handcrafted oriental sweets with a golden touch.",
    images: ["/icons/icon-512.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AuthSession>
          <AppProvider>
            <AudioProvider>
              <Chrome>{children}</Chrome>
            </AudioProvider>
          </AppProvider>
        </AuthSession>
        <RegisterSW />
      </body>
    </html>
  );
}
