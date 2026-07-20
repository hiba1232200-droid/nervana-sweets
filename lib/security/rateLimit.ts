// Token-bucket rate limiter.
// In-memory by default (fine for a single instance / dev). For multi-instance
// production, back it with Upstash Redis — see the commented adapter below.

interface Bucket { tokens: number; updated: number; }
const buckets = new Map<string, Bucket>();

export interface RateResult { success: boolean; remaining: number; reset: number; }

export function rateLimit(key: string, limit = 60, windowMs = 60_000): RateResult {
  const now = Date.now();
  const refillRate = limit / windowMs;
  const b = buckets.get(key) ?? { tokens: limit, updated: now };
  b.tokens = Math.min(limit, b.tokens + (now - b.updated) * refillRate);
  b.updated = now;

  if (b.tokens < 1) {
    buckets.set(key, b);
    return { success: false, remaining: 0, reset: Math.ceil((1 - b.tokens) / refillRate) };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { success: true, remaining: Math.floor(b.tokens), reset: 0 };
}

// Derive a client key from the request (IP + optional identifier).
export function clientKey(req: Request, scope = "global"): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || "unknown";
  return `${scope}:${ip}`;
}

/*
 // Redis-backed adapter (production):
 import { Ratelimit } from "@upstash/ratelimit";
 import { Redis } from "@upstash/redis";
 export const limiter = new Ratelimit({
   redis: Redis.fromEnv(),
   limiter: Ratelimit.slidingWindow(60, "1 m"),
 });
*/
