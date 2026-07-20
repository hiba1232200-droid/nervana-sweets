import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser, hasPermission } from "@/lib/api/respond";
import { z } from "zod";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

const KEYS = { enabled: "exchange_sync_enabled", interval: "exchange_sync_interval_sec", channel: "exchange_channel" };

// GET /api/exchange/config
export const GET = route(async () => {
  const rows = await prisma.websiteSetting.findMany({ where: { key: { in: Object.values(KEYS) } } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return ok({
    enabled: map[KEYS.enabled] ?? true,
    intervalSec: map[KEYS.interval] ?? 60,
    channel: map[KEYS.channel] ?? process.env.TELEGRAM_RATE_CHANNEL ?? "@SaymouaaExchange",
  });
});

const schema = z.object({
  enabled: z.boolean().optional(),
  intervalSec: z.number().int().min(30).max(3600).optional(),
  channel: z.string().max(120).optional(),
});

// PATCH /api/exchange/config  (RBAC: currency.write)
export const PATCH = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "currency.write")) return err("Forbidden", 403);
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await req.json()); } catch { return err("Validation failed", 422); }

  const writes: Promise<unknown>[] = [];
  const set = (key: string, value: unknown) =>
    writes.push(prisma.websiteSetting.upsert({ where: { key }, update: { value: value as any }, create: { key, value: value as any } }));
  if (body.enabled !== undefined) set(KEYS.enabled, body.enabled);
  if (body.intervalSec !== undefined) set(KEYS.interval, body.intervalSec);
  if (body.channel !== undefined) set(KEYS.channel, body.channel);
  await Promise.all(writes);
  await audit({ userId: user!.id, action: "exchange.config", req, meta: body });
  return ok(body);
});
