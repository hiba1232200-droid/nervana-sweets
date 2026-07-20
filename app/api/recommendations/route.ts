import { ok, route, currentUser } from "@/lib/api/respond";
import { popularProducts, personalizedForUser, frequentlyBoughtTogether } from "@/lib/ai/recommend";

export const dynamic = "force-dynamic";

// GET /api/recommendations?type=popular|personalized|fbt&productId=
export const GET = route(async (req) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "popular";
  const productId = searchParams.get("productId");

  if (type === "fbt" && productId) return ok(await frequentlyBoughtTogether(productId, 4));

  if (type === "personalized") {
    const user = await currentUser();
    if (user) return ok(await personalizedForUser(user.id, 8));
  }
  return ok(await popularProducts(8));
});
