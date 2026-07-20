import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

// Liveness/readiness probe (used by Docker healthcheck & uptime monitors).
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
