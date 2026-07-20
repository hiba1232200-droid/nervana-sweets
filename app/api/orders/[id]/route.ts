import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser, hasPermission } from "@/lib/api/respond";
import { audit } from "@/lib/api/audit";
import { sendToUser } from "@/lib/push/webpush";
import { notifyAdmin } from "@/lib/telegram/bot";
import { z } from "zod";
import { OrderStatus, OrderState } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending", PREPARING: "Preparing", READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered",
};

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  state: z.nativeEnum(OrderState).optional(),
  driverId: z.string().optional(),
});

// GET /api/orders/:id
export const GET = route(async (_req, { params }) => {
  const user = await currentUser();
  if (!user) return err("Unauthorized", 401);
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return err("Not found", 404);
  if (order.userId !== user.id && !hasPermission(user, "orders.read")) return err("Forbidden", 403);
  return ok(order);
});

// PATCH /api/orders/:id  (RBAC: orders.write)
export const PATCH = route(async (req, { params }) => {
  const user = await currentUser();
  if (!hasPermission(user, "orders.write")) return err("Forbidden", 403);
  let data: z.infer<typeof patchSchema>;
  try { data = patchSchema.parse(await req.json()); } catch { return err("Validation failed", 422); }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.state ? { state: data.state, paymentStatus: data.state === "REFUNDED" ? "REFUNDED" : undefined } : {}),
      ...(data.driverId ? { driverId: data.driverId } : {}),
    },
  });
  // Telegram alerts for cancellation & delivery.
  if (data.state === "CANCELLED") await notifyAdmin(`❌ <b>Order cancelled</b> — ${order.number}`);
  if (data.status === "DELIVERED") await notifyAdmin(`🏠 <b>Order delivered</b> — ${order.number} · $${Number(order.totalUsd).toFixed(2)}`);

  // Notify the customer of status changes via Web Push.
  if (data.status && order.userId) {
    await sendToUser(order.userId, {
      title: `Order ${order.number}`,
      body: `Your order is now: ${STATUS_LABEL[data.status] ?? data.status}`,
      url: `/order/${order.id}`,
    });
  }

  await audit({ userId: user!.id, action: "order.update", entity: "Order", entityId: params.id, req, meta: data });
  return ok(order);
});
