import prisma from "@/lib/db/prisma";
import { ok, route } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

// GET /api/exchange/history?days= — rate log + high/low stats.
export const GET = route(async (req) => {
  const days = Math.min(365, Number(new URL(req.url).searchParams.get("days") ?? 30));
  const since = new Date(Date.now() - days * 86400000);
  const rows = await prisma.exchangeRate.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    take: 2000,
  });
  const rates = rows.map((r) => Number(r.rate));
  const high = rates.length ? Math.max(...rates) : 0;
  const low = rates.length ? Math.min(...rates) : 0;
  return ok({
    points: rows.map((r) => ({ at: r.createdAt, rate: Number(r.rate), source: r.source })),
    high, low, count: rows.length,
    latest: rates.at(-1) ?? null,
  });
});
