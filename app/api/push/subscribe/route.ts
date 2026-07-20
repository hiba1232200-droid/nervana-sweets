import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser } from "@/lib/api/respond";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string(), auth: z.string() }),
  }),
  topics: z.array(z.enum(["offers", "discounts", "products", "orders"])).default(["offers", "orders"]),
});

// POST /api/push/subscribe — register a browser push subscription.
export const POST = route(async (req) => {
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await req.json()); } catch { return err("Invalid subscription", 400); }
  const user = await currentUser();
  const { endpoint, keys } = body.subscription;
  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, topics: body.topics, userId: user?.id ?? null },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, topics: body.topics, userId: user?.id ?? null, userAgent: req.headers.get("user-agent") || undefined },
  });
  return ok({ id: sub.id, topics: sub.topics });
});

// DELETE /api/push/subscribe?endpoint= — unsubscribe.
export const DELETE = route(async (req) => {
  const endpoint = new URL(req.url).searchParams.get("endpoint");
  if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return ok({ unsubscribed: true });
});
