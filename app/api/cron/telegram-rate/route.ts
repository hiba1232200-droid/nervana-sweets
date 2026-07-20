import { NextResponse } from "next/server";
import { channelHealthy, notifyAdmin } from "@/lib/telegram/bot";
import { latestSavedRate } from "@/lib/exchange/provider";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Configurable-interval health monitor for the Telegram rate channel.
// Rate ingestion itself is real-time via the channel_post webhook; this job
// verifies connectivity and alerts the admin if the channel becomes unreachable.
async function handle(req: Request) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") !== null;
  if (!isVercelCron && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const last = await latestSavedRate();
  let healthy = true;
  try { healthy = await channelHealthy(); } catch { healthy = false; }

  if (!healthy) {
    await notifyAdmin(`⚠️ <b>Telegram rate-channel connection failed.</b>\nContinuing with the last saved rate: <b>${last.toLocaleString()} SYP</b>. Manual override is available in the dashboard.`);
    await prisma.auditLog.create({ data: { action: "exchange.channel_down", meta: { last } } }).catch(() => {});
    return NextResponse.json({ ok: true, connection: "down", rate: last });
  }

  return NextResponse.json({ ok: true, connection: "up", rate: last });
}

export const GET = handle;
export const POST = handle;
