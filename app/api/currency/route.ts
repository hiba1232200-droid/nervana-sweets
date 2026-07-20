import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { exchangeRateSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// GET /api/currency — latest USD→SYP rate.
export const GET = route(async () => {
  const latest = await prisma.exchangeRate.findFirst({ orderBy: { createdAt: "desc" } });
  return ok({ base: "USD", quote: "SYP", rate: latest ? Number(latest.rate) : 14500 });
});

// PATCH /api/currency  (RBAC: currency.write) — records a new rate (history kept).
export const PATCH = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "currency.write")) return err("Forbidden", 403);
  const { rate } = await parseBody(req, exchangeRateSchema);
  const created = await prisma.exchangeRate.create({ data: { base: "USD", quote: "SYP", rate, updatedBy: user!.id } });
  await audit({ userId: user!.id, action: "currency.update", entity: "ExchangeRate", entityId: created.id, req, meta: { rate } });
  return ok({ rate: Number(created.rate) });
});
