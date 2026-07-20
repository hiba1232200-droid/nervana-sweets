"use client";

import type { Order } from "@/lib/stores/AppProvider";

// Generate a QR code data URL for an order (client-side)
export async function orderQr(order: Order): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const payload = JSON.stringify({
    id: order.id,
    total: order.total,
    date: order.date,
    items: order.items.length,
  });
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 320,
    color: { dark: "#0B0B0B", light: "#FFFFFF" },
  });
}

// Generate a downloadable PDF invoice (client-side, jsPDF)
export async function downloadInvoice(order: Order, lang: "ar" | "en" = "en") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const gold: [number, number, number] = [212, 175, 55];
  const ink: [number, number, number] = [11, 11, 11];

  // Header band
  doc.setFillColor(...ink);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(...gold);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("NERVANA SWEETS", 40, 45);
  doc.setFontSize(11);
  doc.setTextColor(230, 210, 150);
  doc.text("Fine Oriental Sweets  •  Luxury Confectionery", 40, 66);

  // Invoice meta
  doc.setTextColor(...ink);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 40, 130);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order No: ${order.id}`, 40, 150);
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 40, 165);

  // Customer
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", W - 220, 130);
  doc.setFont("helvetica", "normal");
  doc.text(order.customer.name || "-", W - 220, 148);
  doc.text(order.customer.phone || "-", W - 220, 163);
  const addr = `${order.customer.street} ${order.customer.building} ${order.customer.address}`.trim();
  doc.text(doc.splitTextToSize(addr || "-", 180), W - 220, 178);

  // Table header
  let y = 215;
  doc.setFillColor(...gold);
  doc.rect(40, y, W - 80, 24, "F");
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Item", 50, y + 16);
  doc.text("Qty", W - 210, y + 16);
  doc.text("Price", W - 150, y + 16);
  doc.text("Total", W - 90, y + 16);
  y += 34;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...ink);
  order.items.forEach((it) => {
    doc.text(doc.splitTextToSize(it.nameEn || it.name, 260), 50, y);
    doc.text(String(it.qty), W - 205, y);
    doc.text(`$${it.price.toFixed(2)}`, W - 155, y);
    doc.text(`$${(it.price * it.qty).toFixed(2)}`, W - 95, y);
    y += 22;
    doc.setDrawColor(230);
    doc.line(40, y - 12, W - 40, y - 12);
  });

  // Total
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", W - 200, y);
  doc.setTextColor(...gold);
  doc.text(`$${order.total.toFixed(2)}`, W - 95, y);

  // QR
  try {
    const qr = await orderQr(order);
    doc.addImage(qr, "PNG", 40, y - 20, 90, 90);
  } catch {}

  // Footer
  doc.setTextColor(120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Estimated delivery time: 10 to 30 minutes.  •  Thank you for shopping with NERVANA.",
    40,
    doc.internal.pageSize.getHeight() - 40
  );

  doc.save(`NERVANA-Invoice-${order.id}.pdf`);
}
