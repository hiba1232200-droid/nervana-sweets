import webpush from "web-push";
import prisma from "@/lib/db/prisma";

// Web Push (VAPID). Generate keys once: `npx web-push generate-vapid-keys`.
let configured = false;
function ensure() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@nervana.sweets", pub, priv);
  configured = true;
  return true;
}

export interface PushPayload { title: string; body: string; url?: string; }

// Send to every subscriber of a topic (offers | discounts | products | orders).
export async function sendToTopic(topic: string, payload: PushPayload) {
  if (!ensure()) return { sent: 0, skipped: true };
  const subs = await prisma.pushSubscription.findMany({ where: { topics: { has: topic } } });
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload)
      );
      sent++;
    } catch (e: any) {
      // Clean up expired/invalid subscriptions
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
      }
    }
  }));
  return { sent };
}

// Direct push to a specific user (e.g. order status updates).
export async function sendToUser(userId: string, payload: PushPayload) {
  if (!ensure()) return { sent: 0, skipped: true };
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload));
      sent++;
    } catch { /* ignore */ }
  }));
  return { sent };
}
