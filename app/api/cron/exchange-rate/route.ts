import { NextResponse } from "next/server";
import { fetchLiveRate, latestSavedRate, saveRate } from "@/lib/exchange/provider";
import { notifyAdmin } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Runs every minute (Vercel cron / external scheduler).
// Prices are stored in USD and rendered via the current rate, so updating the
// rate here instantly updates every product price across the storefront.
async function handle(req: Request) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") !== null;
  if (!isVercelCron && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const live = await fetchLiveRate();
  const last = await latestSavedRate();

  if (live === null) {
    // Source unavailable → keep the latest saved rate, alert the admin.
    await notifyAdmin(`⚠️ <b>Exchange-rate source unavailable.</b>\nUsing last saved rate: <b>${last.toLocaleString()} SYP</b>. Manual override available in the dashboard.`);
    return NextResponse.json({ ok: true, source: "fallback", rate: last, changed: false });
  }

  const changedPct = Math.abs(live - last) / last;
  if (changedPct >= 0.001) {
    await saveRate(Math.round(live));
    await notifyAdmin(`💱 <b>Exchange rate updated</b>\nUSD → SYP: <b>${last.toLocaleString()}</b> → <b>${Math.round(live).toLocaleString()}</b>\nAll product prices updated automatically.`);
    return NextResponse.json({ ok: true, source: "live", rate: Math.round(live), previous: last, changed: true });
  }

  return NextResponse.json({ ok: true, source: "live", rate: Math.round(live), changed: false });
}

export const GET = handle;
export const POST = handle;
