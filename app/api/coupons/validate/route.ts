import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody } from "@/lib/api/respond";
import { couponValidateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// POST /api/coupons/validate  { code }
export const POST = route(async (req) => {
  const { code } = await parseBody(req, couponValidateSchema);
  const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), active: true } });
  if (!coupon) return err("Invalid coupon", 404);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return err("Coupon expired", 410);
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return err("Coupon exhausted", 410);
  return ok({ code: coupon.code, type: coupon.type, value: Number(coupon.value) });
});
