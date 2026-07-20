import { randomBytes, createHmac, timingSafeEqual } from "crypto";

// Double-submit-cookie CSRF tokens for custom mutating endpoints.
// (NextAuth already protects its own routes.) Pair the cookie value with a
// header (x-csrf-token) on unsafe methods and verify with `verifyCsrf`.
const secret = process.env.NEXTAUTH_SECRET || "dev-insecure-secret";

export function issueCsrfToken(): string {
  const raw = randomBytes(24).toString("hex");
  const sig = createHmac("sha256", secret).update(raw).digest("hex");
  return `${raw}.${sig}`;
}

export function verifyCsrf(token: string | null | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [raw, sig] = token.split(".");
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
