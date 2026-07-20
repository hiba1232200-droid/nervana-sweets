import { randomBytes, createHash } from "crypto";

// Cryptographically secure, URL-safe tokens for email verify / password reset.
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// 6-digit numeric OTP for phone verification.
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000);
