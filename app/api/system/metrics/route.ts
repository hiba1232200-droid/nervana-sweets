import os from "os";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/system/metrics — live server + database health for the admin monitor.
export async function GET() {
  const load = os.loadavg()[0];
  const cores = os.cpus().length || 1;
  const cpuPct = Math.min(100, Math.round((load / cores) * 100));
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memPct = Math.round(((totalMem - freeMem) / totalMem) * 100);

  let db: "up" | "down" = "down";
  let dbLatency = 0;
  try {
    const t = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - t;
    db = "up";
  } catch { db = "down"; }

  return NextResponse.json({
    ok: true,
    cpu: { pct: cpuPct, load: Number(load.toFixed(2)), cores },
    memory: { pct: memPct, totalMb: Math.round(totalMem / 1048576), usedMb: Math.round((totalMem - freeMem) / 1048576) },
    storage: { pct: 42, note: "df-based storage — wire to your host's disk API" },
    db: { status: db, latencyMs: dbLatency },
    uptimeSec: Math.round(process.uptime()),
    node: process.version,
    platform: `${os.type()} ${os.release()}`,
    ts: Date.now(),
  });
}
