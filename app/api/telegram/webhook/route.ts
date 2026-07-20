import prisma from "@/lib/db/prisma";
import { answerCallback, editMessageStatus, notifyAdmin } from "@/lib/telegram/bot";
import { ingestRateFromText } from "@/lib/exchange/provider";
import { OrderStatus, OrderState } from "@prisma/client";

function fromRateChannel(post: any): boolean {
  const cfg = process.env.TELEGRAM_RATE_CHANNEL || "";
  const uname = post?.chat?.username ? `@${post.chat.username}` : "";
  const title = post?.chat?.title || "";
  return !cfg || uname.toLowerCase() === cfg.toLowerCase() || title.includes(cfg.replace("@", ""));
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTION_TO_STATUS: Record<string, OrderStatus> = {
  ACCEPT: "PREPARING",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
};

// POST /api/telegram/webhook — receives inline-button callbacks and updates orders.
export async function POST(req: Request) {
  // Verify the secret token Telegram echoes back.
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 403 });
  }

  const update = await req.json().catch(() => null);

  // ── Exchange-rate channel monitor ──
  const post = update?.channel_post || update?.edited_channel_post;
  if (post?.text && fromRateChannel(post)) {
    try {
      const result = await ingestRateFromText(post.text, "telegram");
      await prisma.auditLog.create({ data: { action: "exchange.channel_ingest", meta: result as any } }).catch(() => {});
    } catch { /* keep last rate */ }
    return Response.json({ ok: true });
  }

  const cb = update?.callback_query;
  if (!cb?.data) return Response.json({ ok: true });

  const [kind, orderId, action] = String(cb.data).split(":");
  if (kind !== "order") return Response.json({ ok: true });

  try {
    if (action === "REJECT") {
      await prisma.order.update({ where: { id: orderId }, data: { state: OrderState.CANCELLED } });
      await answerCallback(cb.id, "Order rejected");
      await notifyAdmin(`❌ Order rejected.`);
    } else if (ACTION_TO_STATUS[action]) {
      const status = ACTION_TO_STATUS[action];
      await prisma.order.update({
        where: { id: orderId },
        data: { status, paymentStatus: status === "DELIVERED" ? "PAID" : undefined },
      });
      await answerCallback(cb.id, `Marked ${status.replace(/_/g, " ")}`);
      await editMessageStatus(cb.message.chat.id, cb.message.message_id, status.replace(/_/g, " "), orderId);
    }
    await prisma.auditLog.create({ data: { action: "telegram.order_action", entity: "Order", entityId: orderId, meta: { action } } }).catch(() => {});
  } catch {
    await answerCallback(cb.id, "Order not found");
  }

  return Response.json({ ok: true });
}
