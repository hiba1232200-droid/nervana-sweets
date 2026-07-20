import prisma from "@/lib/db/prisma";
import { ok, route, parseBody } from "@/lib/api/respond";
import { z } from "zod";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  type: z.enum(["page_view", "product_view", "add_to_cart", "purchase", "search"]),
  path: z.string().max(300).optional(),
  productId: z.string().optional(),
  sessionId: z.string().max(80).optional(),
  meta: z.record(z.any()).optional(),
});

// POST /api/analytics — behavioural events feeding customer-behaviour analytics.
export const POST = route(async (req) => {
  const body = await parseBody(req, eventSchema);
  await prisma.analyticsEvent.create({ data: { ...body, meta: body.meta as any } }).catch(() => {});
  return ok({ recorded: true });
});
