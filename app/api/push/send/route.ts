import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { sendToTopic } from "@/lib/push/webpush";
import { audit } from "@/lib/api/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  topic: z.enum(["offers", "discounts", "products", "orders"]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(300),
  url: z.string().max(300).optional(),
});

// POST /api/push/send — broadcast a campaign to a topic (RBAC: marketing.write).
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "marketing.write")) return err("Forbidden", 403);
  const body = await parseBody(req, schema);
  const result = await sendToTopic(body.topic, { title: body.title, body: body.body, url: body.url });
  await audit({ userId: user!.id, action: "push.broadcast", req, meta: { topic: body.topic, ...result } });
  return ok(result);
});
