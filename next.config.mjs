/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server output for Docker (minimal runtime image).
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  // Lint is run separately via `npm run lint`; don't fail production builds on style rules.
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Modern formats first (AVIF → WebP), served by next/image with automatic
    // responsive sizes, lazy-loading and long-term browser caching.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — returning visitors don't re-download
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.googleusercontent.com" }
    ]
  }
};

export default nextConfig;
