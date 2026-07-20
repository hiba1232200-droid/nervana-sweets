// Parse a USD→SYP exchange rate out of a Telegram channel message.
// Handles Arabic-Indic & Eastern-Arabic digits, thousands separators, and
// buy/sell pairs. Returns null when no confident value is found.

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const a = AR_DIGITS.indexOf(d);
    if (a >= 0) return String(a);
    const f = FA_DIGITS.indexOf(d);
    return f >= 0 ? String(f) : d;
  });
}

const USD_HINTS = ["دولار", "الدولار", "usd", "$", "دولار أمريكي", "امريكي", "أمريكي"];
const SELL_HINTS = ["مبيع", "بيع", "sell"];
const BUY_HINTS = ["شراء", "buy"];

function numbersIn(line: string, min: number, max: number): number[] {
  const cleaned = line.replace(/[,،_](?=\d{3}\b)/g, ""); // strip thousands separators
  const matches = cleaned.match(/\d{3,7}(?:\.\d+)?/g) || [];
  return matches.map(Number).filter((n) => Number.isFinite(n) && n >= min && n <= max);
}

export interface ParsedRate { rate: number; basis: "sell" | "buy" | "avg" | "single"; }

export function parseRate(text: string, min = 1000, max = 1_000_000): ParsedRate | null {
  const norm = normalizeDigits(text).toLowerCase();
  const lines = norm.split(/\n|·|•|\||-{2,}/).map((l) => l.trim()).filter(Boolean);

  // 1) Prefer lines that mention USD.
  const usdLines = lines.filter((l) => USD_HINTS.some((h) => l.includes(h)));
  const scan = usdLines.length ? usdLines : lines;

  let sell: number | undefined;
  let buy: number | undefined;
  const singles: number[] = [];

  for (const line of scan) {
    const nums = numbersIn(line, min, max);
    if (!nums.length) continue;
    if (SELL_HINTS.some((h) => line.includes(h))) sell = nums[0];
    else if (BUY_HINTS.some((h) => line.includes(h))) buy = nums[0];
    else singles.push(...nums);
  }

  if (sell && buy) return { rate: Math.round((sell + buy) / 2), basis: "avg" };
  if (sell) return { rate: Math.round(sell), basis: "sell" };
  if (buy) return { rate: Math.round(buy), basis: "buy" };

  if (singles.length) {
    // median of plausible values → resilient to noise
    const sorted = [...singles].sort((a, b) => a - b);
    return { rate: Math.round(sorted[Math.floor(sorted.length / 2)]), basis: "single" };
  }

  // 2) Last resort: any in-bounds number anywhere.
  const all = numbersIn(norm, min, max);
  if (all.length) {
    const sorted = [...all].sort((a, b) => a - b);
    return { rate: Math.round(sorted[Math.floor(sorted.length / 2)]), basis: "single" };
  }
  return null;
}

export interface Validation { valid: boolean; reason?: string; }

export function validateRate(rate: number, last: number | null, opts?: { min?: number; max?: number; maxJump?: number }): Validation {
  const min = opts?.min ?? 1000;
  const max = opts?.max ?? 1_000_000;
  if (!Number.isFinite(rate) || rate <= 0) return { valid: false, reason: "not-a-number" };
  if (rate < min || rate > max) return { valid: false, reason: "out-of-bounds" };
  const maxJump = opts?.maxJump ?? 0;
  if (last && maxJump > 0) {
    const jump = Math.abs(rate - last) / last;
    if (jump > maxJump) return { valid: false, reason: `jump-${(jump * 100).toFixed(0)}%` };
  }
  return { valid: true };
}
