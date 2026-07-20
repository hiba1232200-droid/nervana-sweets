// ── Telegram Bot (admin order notifications + inline status controls) ──
// Uses the Bot API over fetch (no dependency). Configure TELEGRAM_BOT_TOKEN
// and TELEGRAM_ADMIN_CHAT_ID; register the webhook via /api/telegram/set-webhook.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID;
const API = (m: string) => `https://api.telegram.org/bot${TOKEN}/${m}`;

export const telegramEnabled = () => Boolean(TOKEN && ADMIN_CHAT);

async function call(method: string, body: Record<string, unknown>) {
  if (!TOKEN) return null;
  try {
    const res = await fetch(API(method), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// Buttons map to callback_data "order:<id>:<ACTION>"
export function orderKeyboard(orderId: string) {
  const b = (text: string, action: string) => ({ text, callback_data: `order:${orderId}:${action}` });
  return {
    inline_keyboard: [
      [b("✅ Accept", "ACCEPT"), b("❌ Reject", "REJECT")],
      [b("👨‍🍳 Preparing", "PREPARING"), b("📦 Ready", "READY")],
      [b("🛵 Out for delivery", "OUT_FOR_DELIVERY"), b("🏠 Delivered", "DELIVERED")],
    ],
  };
}

interface OrderLike {
  number: string;
  customerName: string;
  phone: string;
  city: string;
  street: string;
  building?: string | null;
  notes?: string | null;
  totalUsd: number | string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  createdAt: Date | string;
  items: { nameEn: string; quantity: number; unitPrice: number | string }[];
}

export function formatOrder(o: OrderLike): string {
  const lines = o.items.map((i) => `   • ${i.nameEn} × ${i.quantity}`).join("\n");
  const when = new Date(o.createdAt).toLocaleString("en-GB", { hour12: false });
  return [
    `🧾 <b>New Order — ${o.number}</b>`,
    ``,
    `👤 <b>${o.customerName}</b>`,
    `📞 ${o.phone}`,
    `📍 ${o.city}, ${o.street}${o.building ? ` — Bldg ${o.building}` : ""}`,
    o.notes ? `📝 ${o.notes}` : ``,
    ``,
    `🛍 <b>Items</b>\n${lines}`,
    ``,
    `💰 <b>Total: $${Number(o.totalUsd).toFixed(2)}</b>`,
    `💳 ${o.paymentMethod ?? "Cash on Delivery"} · ${o.paymentStatus ?? "unpaid"}`,
    `🚚 ${o.status ?? "PENDING"}`,
    `🕒 ${when}`,
  ].filter(Boolean).join("\n");
}

export async function notifyNewOrder(o: OrderLike & { id: string }) {
  if (!telegramEnabled()) return;
  await call("sendMessage", {
    chat_id: ADMIN_CHAT,
    text: formatOrder(o),
    parse_mode: "HTML",
    reply_markup: orderKeyboard(o.id),
  });
}

export async function notifyAdmin(text: string) {
  if (!telegramEnabled()) return;
  await call("sendMessage", { chat_id: ADMIN_CHAT, text, parse_mode: "HTML" });
}

export async function answerCallback(id: string, text: string) {
  await call("answerCallbackQuery", { callback_query_id: id, text });
}

export async function editMessageStatus(chatId: number | string, messageId: number, newStatusLabel: string, orderId: string) {
  await call("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: orderKeyboard(orderId) });
  await call("sendMessage", { chat_id: chatId, text: `➡️ Status updated: <b>${newStatusLabel}</b>`, parse_mode: "HTML" });
}

export async function setWebhook(url: string, secret: string) {
  return call("setWebhook", {
    url, secret_token: secret,
    allowed_updates: ["callback_query", "message", "channel_post", "edited_channel_post"],
  });
}

// Verify the bot can still reach the rate channel (connectivity health check).
export async function channelHealthy(): Promise<boolean> {
  const channel = process.env.TELEGRAM_RATE_CHANNEL;
  if (!TOKEN || !channel) return false;
  const res = await call("getChat", { chat_id: channel });
  return Boolean(res?.ok);
}

// Instant alert on any system error.
export async function notifyError(context: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  await notifyAdmin(`🛑 <b>System error</b> — ${context}\n<code>${msg.slice(0, 300)}</code>`);
}
