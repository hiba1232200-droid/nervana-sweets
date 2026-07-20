import { err, route, currentUser, hasPermission, ok } from "@/lib/api/respond";
import { setWebhook } from "@/lib/telegram/bot";
import { SITE_URL } from "@/lib/seo/schema";

export const dynamic = "force-dynamic";

// POST /api/telegram/set-webhook — one-time registration (RBAC: settings.write).
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "settings.write")) return err("Forbidden", 403);
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const url = `${SITE_URL}/api/telegram/webhook`;
  const result = await setWebhook(url, secret);
  return ok({ url, result });
});
