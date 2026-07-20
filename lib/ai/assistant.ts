import { products, categories, discountedPrice, type Product } from "@/lib/data/products";

export interface AssistantReply { reply: string; productIds: string[] }
type Lang = "ar" | "en";

const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

// On-site catalogue assistant — works with zero external dependencies.
// Handles: recommendations, gifts, ingredients, pricing, order help, FAQ.
export function localAssistant(message: string, lang: Lang = "ar"): AssistantReply {
  const m = message.toLowerCase();
  const pick = (list: Product[], n = 3) => list.slice(0, n).map((p) => p.id);
  const name = (p: Product) => (lang === "ar" ? p.name : p.nameEn);

  // greeting
  if (has(m, ["مرحبا", "اهلا", "أهلا", "السلام", "hi", "hello", "hey"])) {
    return {
      reply: lang === "ar"
        ? "أهلاً بك في نيرفانا! 🌟 أنا مساعدك الشخصي. يمكنني مساعدتك في اختيار الحلويات، اقتراح هدية، شرح المكوّنات، أو إتمام طلبك. بماذا أبدأ؟"
        : "Welcome to NERVANA! 🌟 I'm your personal assistant. I can help you choose sweets, suggest a gift, explain ingredients, or complete your order. How can I help?",
      productIds: pick(products.filter((p) => p.bestSeller)),
    };
  }

  // gifts
  if (has(m, ["هدية", "اهداء", "إهداء", "gift", "present", "box", "علبة"])) {
    const gifts = products.filter((p) => p.category === "gifts");
    return {
      reply: lang === "ar"
        ? "لهدية لا تُنسى، أنصحك بعلب الإهداء الفاخرة لدينا — تغليف ذهبي راقٍ وتشكيلة مختارة بعناية. إليك أفضل خياراتنا:"
        : "For an unforgettable gift, our luxury gift boxes are perfect — elegant golden packaging with a curated selection. Here are my top picks:",
      productIds: pick(gifts),
    };
  }

  // ingredients / allergens
  if (has(m, ["مكون", "مكوّن", "مكونات", "حساسية", "ingredient", "allergen", "nut", "gluten", "مكسرات", "غلوتين"])) {
    const p = products.find((x) => m.includes(x.nameEn.toLowerCase().split(" ")[0]) || m.includes(x.name));
    if (p) {
      return {
        reply: lang === "ar"
          ? `${name(p)} تحتوي على: ${p.ingredients}.\n⚠️ ${p.allergens}.`
          : `${p.nameEn} contains: ${p.ingredientsEn}.\n⚠️ ${p.allergensEn}.`,
        productIds: [p.id],
      };
    }
    return {
      reply: lang === "ar"
        ? "جميع حلوياتنا تُحضّر من مكوّنات طبيعية 100٪: دقيق فاخر، سمن بلدي، فستق حلبي، عسل طبيعي وماء ورد. تحتوي معظمها على مكسّرات وغلوتين ومنتجات ألبان. أخبرني باسم المنتج لأعطيك التفاصيل الدقيقة."
        : "All our sweets use 100% natural ingredients: premium flour, ghee, Aleppo pistachios, natural honey and rose water. Most contain nuts, gluten and dairy. Tell me a product name for exact details.",
      productIds: pick(products.filter((p) => p.featured)),
    };
  }

  // price / budget
  if (has(m, ["سعر", "رخيص", "ارخص", "أرخص", "price", "cheap", "budget", "افضل سعر"])) {
    const cheapest = [...products].sort((a, b) => discountedPrice(a) - discountedPrice(b));
    return {
      reply: lang === "ar"
        ? "إليك أفضل خياراتنا من حيث السعر مع الحفاظ على الفخامة:"
        : "Here are our best value options without compromising on luxury:",
      productIds: pick(cheapest),
    };
  }

  // best sellers / recommend
  if (has(m, ["افضل", "أفضل", "انصح", "أنصح", "اقترح", "recommend", "best", "popular", "top", "مبيعا"])) {
    return {
      reply: lang === "ar"
        ? "الأكثر مبيعاً وحبّاً لدى عملائنا — لن تخيب ظنك:"
        : "Our best sellers, loved by our clients — you won't be disappointed:",
      productIds: pick(products.filter((p) => p.bestSeller), 4),
    };
  }

  // order help
  if (has(m, ["طلب", "اطلب", "أطلب", "كيف اشتري", "checkout", "order", "buy", "توصيل", "delivery"])) {
    return {
      reply: lang === "ar"
        ? "إتمام طلبك سهل جداً:\n1️⃣ أضف الأصناف إلى السلة 🛒\n2️⃣ اذهب إلى السلة واستخدم كود خصم إن وجد\n3️⃣ أدخل عنوانك ورقم هاتفك\n4️⃣ أكّد الطلب — التوصيل خلال 10 إلى 30 دقيقة! 🛵"
        : "Completing your order is easy:\n1️⃣ Add items to your cart 🛒\n2️⃣ Open the cart and apply a coupon if you have one\n3️⃣ Enter your address and phone\n4️⃣ Confirm — delivery in 10 to 30 minutes! 🛵",
      productIds: pick(products.filter((p) => p.bestSeller)),
    };
  }

  // occasion-based recommendations
  const occasions: { keys: string[]; ar: string; en: string; filter: (p: Product) => boolean }[] = [
    { keys: ["زفاف", "عرس", "wedding", "زواج"], ar: "لحفل الزفاف، لا شيء يضاهي علب الإهداء الفاخرة والتشكيلات الذهبية الراقية:", en: "For a wedding, nothing beats our luxury gift boxes and golden assortments:", filter: (p) => p.category === "gifts" || p.category === "nuts" },
    { keys: ["عيد ميلاد", "ميلاد", "birthday"], ar: "لعيد ميلاد سعيد، إليك اختيارات مميّزة تُدخل البهجة:", en: "For a joyful birthday, here are delightful picks:", filter: (p) => p.category === "gifts" || p.bestSeller === true },
    { keys: ["رمضان", "ramadan"], ar: "لأجواء رمضان، مجموعتنا الرمضانية الفاخرة هي الاختيار الأمثل:", en: "For Ramadan, our luxury Ramadan collection is the perfect choice:", filter: (p) => p.seasonal === "ramadan" || p.category === "gifts" },
    { keys: ["عيد", "eid"], ar: "بمناسبة العيد، إليك أرقى ما نقدّم:", en: "For Eid, here is our finest selection:", filter: (p) => p.seasonal === "eid" || p.category === "gifts" || p.bestSeller === true },
    { keys: ["تخرج", "graduation", "نجاح"], ar: "احتفالاً بالتخرّج، علبة إهداء فاخرة تليق بالإنجاز:", en: "To celebrate a graduation, a luxury gift box worthy of the achievement:", filter: (p) => p.category === "gifts" },
    { keys: ["ضيافة", "ضيوف", "hospitality", "guests"], ar: "لكرم الضيافة، تشكيلات وفيرة تُبهر ضيوفك:", en: "For gracious hospitality, generous assortments to impress your guests:", filter: (p) => p.category === "gifts" || p.category === "baklava" },
  ];
  for (const oc of occasions) {
    if (has(m, oc.keys)) {
      const items = products.filter(oc.filter);
      return { reply: lang === "ar" ? oc.ar : oc.en, productIds: pick(items.length ? items : products.filter((p) => p.category === "gifts"), 4) };
    }
  }

  // budget-based
  const budgetMatch = m.match(/(\d{1,4})/);
  if (budgetMatch && has(m, ["ميزانية", "أقل من", "اقل من", "حدود", "budget", "under", "below", "$", "دولار"])) {
    const budget = Number(budgetMatch[1]);
    const within = products.filter((p) => discountedPrice(p) <= budget).sort((a, b) => discountedPrice(b) - discountedPrice(a));
    if (within.length) {
      return { reply: lang === "ar" ? `إليك أفضل الخيارات ضمن ميزانية ${budget}$:` : `Here are the best options within a $${budget} budget:`, productIds: pick(within, 4) };
    }
    return { reply: lang === "ar" ? `لا يوجد منتج ضمن ${budget}$ حالياً، لكن إليك أقرب الخيارات:` : `Nothing under $${budget} right now, but here are the closest options:`, productIds: pick([...products].sort((a, b) => discountedPrice(a) - discountedPrice(b)), 4) };
  }

  // compare
  if (has(m, ["قارن", "مقارنة", "compare", "vs", "مقابل", "الفرق"])) {
    const matched = products.filter((p) => m.includes(p.nameEn.toLowerCase().split(" ")[0]) || m.includes(p.name.split(" ")[0]));
    if (matched.length >= 2) {
      const [a, b] = matched;
      return {
        reply: lang === "ar"
          ? `مقارنة سريعة:\n• ${a.name} — ${a.weight}، ${discountedPrice(a).toFixed(0)}$، تقييم ${a.rating}\n• ${b.name} — ${b.weight}، ${discountedPrice(b).toFixed(0)}$، تقييم ${b.rating}\nكلاهما فاخر؛ اختر حسب ذوقك وميزانيتك.`
          : `Quick comparison:\n• ${a.nameEn} — ${a.weight}, $${discountedPrice(a).toFixed(0)}, rated ${a.rating}\n• ${b.nameEn} — ${b.weight}, $${discountedPrice(b).toFixed(0)}, rated ${b.rating}\nBoth are luxurious; choose by taste and budget.`,
        productIds: [a.id, b.id],
      };
    }
    return { reply: lang === "ar" ? "أخبرني باسمَي المنتجين اللذين تودّ مقارنتهما وسأساعدك فوراً." : "Tell me the two products you'd like to compare and I'll help right away.", productIds: pick(products.filter((p) => p.bestSeller)) };
  }

  // categories
  const cat = categories.find((c) => m.includes(c.id) || m.includes(c.nameEn.toLowerCase()) || m.includes(c.name));
  if (cat) {
    return {
      reply: lang === "ar" ? `إليك أجمل ما لدينا من ${cat.name}:` : `Here are our finest ${cat.nameEn}:`,
      productIds: pick(products.filter((p) => p.category === cat.id)),
    };
  }

  // fallback
  return {
    reply: lang === "ar"
      ? "يسعدني مساعدتك! يمكنني اقتراح حلويات، اختيار هدية مثالية، شرح المكوّنات، أو إرشادك لإتمام الطلب. جرّب أن تسألني: «اقترح لي هدية» أو «ما الأكثر مبيعاً؟»"
      : "Happy to help! I can suggest sweets, pick the perfect gift, explain ingredients, or guide you through checkout. Try asking: \"suggest a gift\" or \"what's your best seller?\"",
    productIds: pick(products.filter((p) => p.featured), 4),
  };
}

// Optional LLM upgrade — used when AI_API_KEY is configured.
export async function llmAssistant(userMessage: string, lang: Lang): Promise<string | null> {
  const key = process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER;
  if (!key || !provider) return null;
  const system = `You are the NERVANA Sweets concierge — a warm, elegant assistant for a luxury oriental sweets brand. Reply in ${lang === "ar" ? "Arabic" : "English"}. Help with product recommendations, gifts, ingredients/allergens, and completing orders. Delivery is 10–30 minutes. Keep replies concise and premium.`;
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: userMessage }], max_tokens: 300 }),
      });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? null;
    }
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: process.env.AI_MODEL || "claude-3-5-haiku-latest", max_tokens: 300, system, messages: [{ role: "user", content: userMessage }] }),
      });
      const data = await res.json();
      return data?.content?.[0]?.text ?? null;
    }
  } catch { /* fall through to local */ }
  return null;
}
