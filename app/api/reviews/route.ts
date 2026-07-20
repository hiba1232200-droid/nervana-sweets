import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser } from "@/lib/api/respond";
import { reviewSchema } from "@/lib/validation/schemas";
import { cleanInput } from "@/lib/security/sanitize";
import { notifyAdmin } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

// GET /api/reviews?productId=  — approved reviews only.
export const GET = route(async (req) => {
  const productId = new URL(req.url).searchParams.get("productId") ?? undefined;
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED", ...(productId ? { productId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { name: true, image: true } } },
  });
  return ok(reviews);
});

// POST /api/reviews — authenticated; enters moderation queue.
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!user) return err("Unauthorized", 401);
  const body = await parseBody(req, reviewSchema);
  const review = await prisma.review.create({
    data: {
      productId: body.productId,
      userId: user.id,
      rating: body.rating,
      text: cleanInput(body.text, 2000),
      imageUrl: body.imageUrl,
      status: "PENDING",
    },
  });
  await prisma.notification.create({ data: { type: "REVIEW", title: "New Review", body: `${body.rating}★ pending moderation` } });
  await notifyAdmin(`⭐ <b>New review submitted</b> — ${body.rating}★ (pending moderation).`);
  return ok(review, 201);
});
