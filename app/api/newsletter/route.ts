import prisma from "@/lib/db/prisma";
import { ok, route, parseBody } from "@/lib/api/respond";
import { newsletterSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// POST /api/newsletter — store subscription as a website setting bucket.
export const POST = route(async (req) => {
  const { email } = await parseBody(req, newsletterSchema);
  const key = "newsletter_subscribers";
  const existing = await prisma.websiteSetting.findUnique({ where: { key } });
  const list = new Set<string>(Array.isArray(existing?.value) ? (existing!.value as string[]) : []);
  list.add(email.toLowerCase());
  await prisma.websiteSetting.upsert({
    where: { key },
    update: { value: Array.from(list) as any },
    create: { key, value: Array.from(list) as any },
  });
  return ok({ subscribed: true });
});
