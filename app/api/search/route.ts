import { ok, err, route } from "@/lib/api/respond";
import { searchAutocomplete } from "@/lib/ai/recommend";

export const dynamic = "force-dynamic";

// GET /api/search?q= — autocomplete suggestions.
export const GET = route(async (req) => {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return err("Query too short", 400);
  const results = await searchAutocomplete(q, 6);
  return ok(results);
});
