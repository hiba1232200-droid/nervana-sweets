import { ok, err, route } from "@/lib/api/respond";
import { z } from "zod";
import { localAssistant, llmAssistant } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(500),
  lang: z.enum(["ar", "en"]).default("ar"),
});

// POST /api/ai/chat — luxury concierge. LLM when configured, on-site AI otherwise.
export const POST = route(async (req) => {
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await req.json()); } catch { return err("Invalid message", 400); }

  const local = localAssistant(body.message, body.lang);
  const llm = await llmAssistant(body.message, body.lang);
  return ok({ reply: llm || local.reply, productIds: local.productIds });
});
