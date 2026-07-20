import prisma from "@/lib/db/prisma";
import { parseRate, validateRate } from "./parse";
import { notifyAdmin } from "@/lib/telegram/bot";

// Fetches the live USD→SYP rate from a trusted provider, with a saved-rate
// fallback. Default provider: open.er-api.com (free, no API key).
const URL = process.env.EXCHANGE_RATE_URL || "https://open.er-api.com/v6/latest/USD";

const MIN = Number(process.env.EXCHANGE_MIN || 1000);
const MAX = Number(process.env.EXCHANGE_MAX || 1_000_000);
const MAX_JUMP = Number(process.env.EXCHANGE_MAX_JUMP || 0.4);

export async function fetchLiveRate(): Promise<number | null> {
  try {
    const res = await fetch(URL, { next: { revalidate: 0 }, cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.SYP ?? data?.conversion_rates?.SYP ?? data?.SYP;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

export async function latestSavedRate(): Promise<number> {
  const row = await prisma.exchangeRate.findFirst({ orderBy: { createdAt: "desc" } });
  return row ? Number(row.rate) : 14500;
}

export async function saveRate(rate: number, updatedBy = "auto-sync", source = "auto", rawMessage?: string) {
  return prisma.exchangeRate.create({ data: { base: "USD", quote: "SYP", rate, updatedBy, source, rawMessage } });
}

export interface IngestResult { ok: boolean; rate?: number; previous?: number; reason?: string; changed?: boolean; }

// Parse → validate → persist → notify. Shared by the Telegram channel webhook.
export async function ingestRateFromText(text: string, source = "telegram"): Promise<IngestResult> {
  const parsed = parseRate(text, MIN, MAX);
  if (!parsed) return { ok: false, reason: "no-rate-found" };

  const last = await latestSavedRate();
  const check = validateRate(parsed.rate, last, { min: MIN, max: MAX, maxJump: MAX_JUMP });
  if (!check.valid) {
    await notifyAdmin(`⚠️ <b>Rejected exchange-rate message.</b>\nParsed: <b>${parsed.rate.toLocaleString()}</b> — reason: ${check.reason}. Keeping <b>${last.toLocaleString()}</b>.`);
    return { ok: false, reason: check.reason };
  }

  const changed = Math.abs(parsed.rate - last) / last >= 0.0005;
  if (!changed) return { ok: true, rate: parsed.rate, previous: last, changed: false };

  await saveRate(parsed.rate, "telegram-channel", source, text.slice(0, 500));
  await notifyAdmin(`💱 <b>Exchange rate updated from channel</b>\nUSD → SYP: <b>${last.toLocaleString()}</b> → <b>${parsed.rate.toLocaleString()}</b> (${parsed.basis})\nAll product prices &amp; carts updated automatically.`);
  return { ok: true, rate: parsed.rate, previous: last, changed: true };
}
