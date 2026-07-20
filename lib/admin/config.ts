// ────────────────────────────────────────────────────────────────
//  SECRET ADMIN CONFIG
//  The dashboard lives at a non-guessable path and is never linked
//  from the storefront, footer, sitemap or robots (it is disallowed).
//  Change ADMIN_PATH to your own secret slug before deploying.
// ────────────────────────────────────────────────────────────────
export const ADMIN_PATH = "/control-a7x92k";

// Demo credentials (replace with a real encrypted-password backend).
// Password shown here is only a client-side demo gate.
export const ADMIN_DEMO = {
  username: "owner",
  password: "Nervana@2026",
  // Any 6-digit code works in the demo; the "expected" one is shown to help testing.
  twoFactor: "246810",
};

// Auto-logout after this much inactivity (ms).
export const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
