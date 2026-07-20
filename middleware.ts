import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit, clientKey } from "@/lib/security/rateLimit";
import { ADMIN_PATH } from "@/lib/admin/config";

// Content-Security-Policy — tighten `script-src` with nonces for maximum strictness.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc https://*.googleusercontent.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "connect-src 'self' https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  // HSTS — only meaningful over HTTPS (production).
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit the API surface (per-IP token bucket).
  if (pathname.startsWith("/api/")) {
    const isAuth = pathname.startsWith("/api/auth");
    const { success, reset } = rateLimit(clientKey(req, "api"), isAuth ? 20 : 100, 60_000);
    if (!success) {
      return withSecurityHeaders(
        new NextResponse(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil(reset / 1000)) },
        }) as unknown as NextResponse
      );
    }
  }

  // Optional production enforcement of the hidden dashboard via NextAuth RBAC.
  // Enable by setting ADMIN_ENFORCE_AUTH=true (the client demo gate stays as UX).
  if (process.env.ADMIN_ENFORCE_AUTH === "true" && pathname.startsWith(ADMIN_PATH)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = (token as any)?.role;
    if (!token || !["owner", "admin", "manager"].includes(role)) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/", req.url)));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Run on everything except static assets & image optimizer.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons).*)"],
};
