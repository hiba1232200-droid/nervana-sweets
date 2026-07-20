import { z } from "zod";

// Central input-validation schemas (used by every API route).
// Rejects malformed / malicious payloads before they reach the DB.

export const emailSchema = z.string().email().max(200);
export const phoneSchema = z.string().min(6).max(30).regex(/^[0-9+\-\s()]+$/);

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  password: z.string().min(8).max(200)
    .regex(/[A-Z]/, "one uppercase")
    .regex(/[a-z]/, "one lowercase")
    .regex(/\d/, "one digit"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
  totp: z.string().regex(/^\d{6}$/).optional(),
  captchaToken: z.string().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: phoneSchema,
  city: z.string().min(2).max(120),
  street: z.string().min(2).max(200),
  building: z.string().max(60).optional(),
  notes: z.string().max(500).optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customer: addressSchema,
  couponCode: z.string().max(40).optional().nullable(),
  loyaltyRedeem: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  nameEn: z.string().min(2).max(200),
  categoryId: z.string().min(1),
  priceUsd: z.number().min(0).max(100000),
  discount: z.number().int().min(0).max(100).default(0),
  stock: z.number().int().min(0).default(0),
  weight: z.string().max(60).optional(),
  descriptionEn: z.string().max(4000).optional(),
  ingredientsEn: z.string().max(2000).optional(),
  allergensEn: z.string().max(1000).optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
});

export const couponValidateSchema = z.object({ code: z.string().min(1).max(40) });
export const exchangeRateSchema = z.object({ rate: z.number().min(0.0001).max(1_000_000) });
export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(2).max(2000),
  imageUrl: z.string().url().optional(),
});
export const newsletterSchema = z.object({ email: emailSchema });
export const searchSchema = z.object({ q: z.string().min(1).max(80) });

// ── Auth flows (Part 4) ──────────────────────────────────────────────
const strongPassword = z.string().min(8).max(200)
  .regex(/[A-Z]/, "one uppercase").regex(/[a-z]/, "one lowercase").regex(/\d/, "one digit");

export const verifyEmailSchema = z.object({ token: z.string().min(10).max(200) });
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: z.string().min(10).max(200), password: strongPassword });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: strongPassword });
export const otpRequestSchema = z.object({ phone: phoneSchema });
export const otpVerifySchema = z.object({ phone: phoneSchema, code: z.string().regex(/^\d{6}$/) });
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  image: z.string().url().max(500).optional(),
  phone: phoneSchema.optional(),
});
export const mediaUpdateSchema = z.object({
  filename: z.string().min(1).max(120).optional(),
  alt: z.string().max(200).optional(),
  folder: z.enum(["PRODUCTS", "CATEGORIES", "BANNERS", "PROMOS", "GALLERY", "ASSETS"]).optional(),
});
