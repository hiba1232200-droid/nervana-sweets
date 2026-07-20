import bcrypt from "bcryptjs";

// Password hashing. bcrypt (cost 12) by default — portable, no native build.
// For Argon2id, swap to the `argon2` package (see README notes).
const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Basic strength policy — enforced alongside zod validation.
export function isStrongPassword(pw: string): boolean {
  return /.{8,}/.test(pw) && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
}
