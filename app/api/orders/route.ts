import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser, hasPermission } from "@/lib/api/respond";
import { createOrderSchema } from "@/lib/validation/schemas";
import { audit } from "@/lib/api/audit";
import { notifyNewOrder, notifyAdmin } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

const orderNumber = () => "NV-" + Math.random().toString(36).slice(2, 8).toUpperCase();

// GET /api/orders — admins see all; customers see their own.
export const GET = route(async (req) => {
  const user = await currentUser();
  if (!user) return err("Unauthorized", 401);
  const isAdmin = hasPermission(user, "orders.read");
  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });
  return ok(orders);
});

// POST /api/orders — prices are recomputed server-side (never trust the client).
export const POST = route(async (req) => {
  const user = await currentUser();
  const body = await parseBody(req, createOrderSchema);

  const ids = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });

  let subtotal = 0;
  const items = body.items.map((line) => {
    const p = products.find((x) => x.id === line.productId);
    if (!p) throw err(`Product ${line.productId} not found`, 400);
    if (p.stock < line.quantity) throw err(`Insufficient stock for ${p.nameEn}`, 409);
    const unit = Number(p.priceUsd) * (1 - p.discount / 100);
    subtotal += unit * line.quantity;
    return { productId: p.id, name: p.name, nameEn: p.nameEn, unitPrice: unit.toFixed(2), quantity: line.quantity };
  });

  // Coupon (validated server-side)
  let discount = 0;
  let couponCode: string | null = null;
  if (body.couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: body.couponCode.toUpperCase(), active: true } });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      discount = coupon.type === "PERCENT" ? subtotal * (Number(coupon.value) / 100) : Number(coupon.value);
      couponCode = coupon.code;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
  }

  const zone = await prisma.deliveryZone.findFirst({ where: { active: true } });
  const deliveryFee = zone && subtotal < 50 ? Number(zone.feeUsd) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: orderNumber(),
        userId: user?.id,
        customerName: body.customer.fullName,
        phone: body.customer.phone,
        city: body.customer.city,
        street: body.customer.street,
        building: body.customer.building,
        notes: body.customer.notes,
        subtotalUsd: subtotal.toFixed(2),
        deliveryUsd: deliveryFee.toFixed(2),
        discountUsd: discount.toFixed(2),
        totalUsd: total.toFixed(2),
        couponCode,
        items: { create: items as any },
      },
      include: { items: true },
    });
    // Decrement stock
    for (const line of body.items) {
      await tx.product.update({ where: { id: line.productId }, data: { stock: { decrement: line.quantity } } });
    }
    // Admin notification
    await tx.notification.create({
      data: { type: "ORDER", title: "New Order", body: `${created.number} · $${total.toFixed(2)}` },
    });
    return created;
  });

  await audit({ userId: user?.id, action: "order.create", entity: "Order", entityId: order.id, req });

  // Instant Telegram notification with inline status controls.
  await notifyNewOrder({
    id: order.id, number: order.number, customerName: order.customerName, phone: order.phone,
    city: order.city, street: order.street, building: order.building, notes: order.notes,
    totalUsd: Number(order.totalUsd), paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
    status: order.status, createdAt: order.createdAt,
    items: order.items.map((i) => ({ nameEn: i.nameEn, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
  });

  // Low-/out-of-stock alerts after the sale.
  for (const line of body.items) {
    const p = products.find((x) => x.id === line.productId);
    if (!p) continue;
    const left = p.stock - line.quantity;
    if (left <= 0) {
      await prisma.notification.create({ data: { type: "STOCK", title: "Out of Stock", body: p.nameEn } }).catch(() => {});
      await notifyAdmin(`⛔ <b>Out of stock</b> — ${p.nameEn}`);
    } else if (left <= 5) {
      await prisma.notification.create({ data: { type: "STOCK", title: "Low Stock", body: `${p.nameEn} · ${left} left` } }).catch(() => {});
      await notifyAdmin(`📉 <b>Low stock</b> — ${p.nameEn} (${left} left)`);
    }
  }

  return ok(order, 201);
});
