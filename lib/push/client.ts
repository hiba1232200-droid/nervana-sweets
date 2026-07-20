"use client";

// Client-side Web Push subscription helper (shared by the opt-in UI + soft prompt).
export function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    return !!(await reg.pushManager.getSubscription());
  } catch { return false; }
}

// Requests permission, subscribes, and registers with the server. Returns success.
export async function subscribePush(topics: string[]): Promise<boolean> {
  if (!pushSupported()) return false;
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted" || !key) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
    await fetch("/api/push/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), topics }),
    }).catch(() => {});
    return true;
  } catch { return false; }
}

export async function unsubscribePush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: "DELETE" }).catch(() => {});
      await sub.unsubscribe();
    }
  } catch { /* ignore */ }
}
