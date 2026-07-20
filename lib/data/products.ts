export type Badge = "new" | "bestSeller" | "limited" | "discount";

export interface Review {
  id: string;
  name: string;
  nameEn: string;
  rating: number;
  date: string;
  text: string;
  textEn: string;
  image?: string;
  avatar: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  price: number; // USD base price
  discount: number; // percent 0-100
  images: string[];
  desc: string;
  descEn: string;
  ingredients: string;
  ingredientsEn: string;
  allergens: string;
  allergensEn: string;
  weight: string;
  stock: number;
  rating: number;
  ratingCount: number;
  badges: Badge[];
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  seasonal?: string;
  reviews: Review[];
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

// Curated food photography (oriental sweets / desserts) from Unsplash
const P = {
  baklava: "photo-1519676867240-f03562e64548",
  baklava2: "photo-1571877227200-a0d98ea607e9",
  kunafa: "photo-1600617953089-90b0e2f0c5e0",
  maamoul: "photo-1509365465985-25d11c17e812",
  dates: "photo-1601050690597-df0568f70950",
  turkish: "photo-1541599468348-e96984315921",
  halva: "photo-1505253716362-afaea1d3d1af",
  nougat: "photo-1548907040-4baa42d10919",
  pistachio: "photo-1558326567-98ae2405596b",
  chocolate: "photo-1481391319762-47dff72954d9",
  gift: "photo-1549007994-cb92caebd54b",
  assorted: "photo-1587244141733-cc3e5f6f76b6",
};

export const categories = [
  { id: "baklava", name: "بقلاوة", nameEn: "Baklava", image: img(P.baklava), count: 24 },
  { id: "kunafa", name: "كنافة", nameEn: "Kunafa", image: img(P.kunafa), count: 12 },
  { id: "maamoul", name: "معمول", nameEn: "Maamoul", image: img(P.maamoul), count: 18 },
  { id: "turkish", name: "حلقوم", nameEn: "Turkish Delight", image: img(P.turkish), count: 15 },
  { id: "nuts", name: "مكسّرات فاخرة", nameEn: "Luxury Nuts", image: img(P.pistachio), count: 20 },
  { id: "gifts", name: "علب الإهداء", nameEn: "Gift Boxes", image: img(P.gift), count: 30 },
];

const baseReviews: Review[] = [
  {
    id: "r1",
    name: "لمى الحاج",
    nameEn: "Lama H.",
    rating: 5,
    date: "2026-06-12",
    text: "أفخم حلويات تذوّقتها، التغليف الذهبي راقٍ جداً والطعم لا يُوصف!",
    textEn: "The finest sweets I've ever tasted — the golden packaging is exquisite and the flavor is beyond words!",
    image: img(P.baklava2),
    avatar: "https://i.pravatar.cc/100?img=45",
  },
  {
    id: "r2",
    name: "خالد منصور",
    nameEn: "Khaled M.",
    rating: 5,
    date: "2026-05-28",
    text: "وصل الطلب خلال 20 دقيقة وكان طازجاً. تجربة فاخرة بكل المقاييس.",
    textEn: "Arrived within 20 minutes, perfectly fresh. A luxurious experience by every measure.",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "r3",
    name: "سارة عبدالله",
    nameEn: "Sara A.",
    rating: 4,
    date: "2026-05-10",
    text: "جودة ممتازة وخدمة عملاء راقية، أنصح بها بشدّة للمناسبات.",
    textEn: "Excellent quality and elegant customer service — highly recommended for occasions.",
    image: img(P.gift),
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

function make(
  i: number,
  data: Partial<Product> & Pick<Product, "name" | "nameEn" | "category" | "price" | "images">
): Product {
  return {
    id: `p${i}`,
    slug: `product-${i}`,
    discount: 0,
    desc:
      "تحفة من الحلويات الشرقية محضّرة يدوياً بعناية فائقة من أجود المكوّنات الطبيعية، مغطّاة بطبقة رقيقة من الفستق الحلبي الفاخر ومحلّاة بقطر الورد الأصيل.",
    descEn:
      "A masterpiece of oriental confectionery, handcrafted with utmost care from the finest natural ingredients, topped with premium Aleppo pistachios and sweetened with authentic rose syrup.",
    ingredients: "دقيق فاخر، سمن بلدي، فستق حلبي، سكر، ماء ورد، عسل طبيعي",
    ingredientsEn: "Premium flour, ghee, Aleppo pistachios, sugar, rose water, natural honey",
    allergens: "يحتوي على مكسّرات، غلوتين، ومنتجات ألبان",
    allergensEn: "Contains nuts, gluten, and dairy",
    weight: "500 غ",
    stock: 24,
    rating: 4.8,
    ratingCount: 126,
    badges: [],
    reviews: baseReviews,
    ...data,
  } as Product;
}

export const products: Product[] = [
  make(1, {
    name: "بقلاوة الفستق الملكية", nameEn: "Royal Pistachio Baklava", category: "baklava",
    price: 34, discount: 15, images: [img(P.baklava), img(P.baklava2), img(P.assorted)],
    weight: "750 غ", stock: 18, rating: 4.9, ratingCount: 212,
    badges: ["bestSeller", "discount"], featured: true, bestSeller: true,
  }),
  make(2, {
    name: "كنافة نابلسية بالجبن", nameEn: "Nabulsi Cheese Kunafa", category: "kunafa",
    price: 28, discount: 0, images: [img(P.kunafa), img(P.assorted)],
    weight: "600 غ", stock: 9, rating: 4.7, ratingCount: 154,
    badges: ["bestSeller"], featured: true, bestSeller: true,
  }),
  make(3, {
    name: "معمول التمر الفاخر", nameEn: "Premium Date Maamoul", category: "maamoul",
    price: 22, discount: 0, images: [img(P.maamoul), img(P.dates)],
    weight: "500 غ", stock: 40, rating: 4.8, ratingCount: 98,
    badges: ["new"], isNew: true, featured: true,
  }),
  make(4, {
    name: "حلقوم الورد بالفستق", nameEn: "Rose Pistachio Turkish Delight", category: "turkish",
    price: 26, discount: 20, images: [img(P.turkish), img(P.nougat)],
    weight: "450 غ", stock: 3, rating: 4.6, ratingCount: 77,
    badges: ["limited", "discount"], seasonal: "eid",
  }),
  make(5, {
    name: "تشكيلة المكسّرات الذهبية", nameEn: "Golden Nut Assortment", category: "nuts",
    price: 48, discount: 0, images: [img(P.pistachio), img(P.assorted)],
    weight: "800 غ", stock: 15, rating: 5.0, ratingCount: 143,
    badges: ["bestSeller"], bestSeller: true, featured: true,
  }),
  make(6, {
    name: "علبة الإهداء الملكية", nameEn: "Royal Gift Box", category: "gifts",
    price: 89, discount: 10, images: [img(P.gift), img(P.assorted)],
    weight: "1.5 كغ", stock: 12, rating: 4.9, ratingCount: 201,
    badges: ["bestSeller", "discount"], featured: true, bestSeller: true, seasonal: "ramadan",
  }),
  make(7, {
    name: "بقلاوة الجوز بالعسل", nameEn: "Walnut Honey Baklava", category: "baklava",
    price: 30, discount: 0, images: [img(P.baklava2), img(P.baklava)],
    weight: "700 غ", stock: 22, rating: 4.7, ratingCount: 88,
    badges: ["new"], isNew: true,
  }),
  make(8, {
    name: "حلاوة الطحينية بالفستق", nameEn: "Pistachio Halva", category: "nuts",
    price: 19, discount: 0, images: [img(P.halva), img(P.pistachio)],
    weight: "400 غ", stock: 30, rating: 4.5, ratingCount: 64,
    badges: [],
  }),
  make(9, {
    name: "نوغا الفستق الفاخر", nameEn: "Luxury Pistachio Nougat", category: "nuts",
    price: 24, discount: 25, images: [img(P.nougat), img(P.turkish)],
    weight: "350 غ", stock: 6, rating: 4.6, ratingCount: 52,
    badges: ["limited", "discount"],
  }),
  make(10, {
    name: "معمول الجوز المشكّل", nameEn: "Assorted Walnut Maamoul", category: "maamoul",
    price: 25, discount: 0, images: [img(P.maamoul), img(P.assorted)],
    weight: "600 غ", stock: 28, rating: 4.8, ratingCount: 110,
    badges: ["new"], isNew: true,
  }),
  make(11, {
    name: "كنافة الشوكولا الفاخرة", nameEn: "Chocolate Kunafa Deluxe", category: "kunafa",
    price: 32, discount: 0, images: [img(P.chocolate), img(P.kunafa)],
    weight: "550 غ", stock: 14, rating: 4.7, ratingCount: 73,
    badges: ["new"], isNew: true, seasonal: "winter",
  }),
  make(12, {
    name: "صندوق رمضان الكبير", nameEn: "Grand Ramadan Box", category: "gifts",
    price: 120, discount: 15, images: [img(P.assorted), img(P.gift)],
    weight: "2.5 كغ", stock: 8, rating: 5.0, ratingCount: 167,
    badges: ["limited", "discount"], seasonal: "ramadan", featured: true,
  }),
];

export const seasonalCollections = [
  { id: "ramadan", name: "مجموعة رمضان", nameEn: "Ramadan Collection", image: img("photo-1587244141733-cc3e5f6f76b6") },
  { id: "eid", name: "مجموعة العيد", nameEn: "Eid Collection", image: img(P.gift) },
  { id: "winter", name: "مجموعة الشتاء", nameEn: "Winter Collection", image: img(P.chocolate) },
];

export const galleryImages = [
  img(P.baklava), img(P.kunafa), img(P.maamoul), img(P.turkish),
  img(P.pistachio), img(P.gift), img(P.nougat), img(P.assorted),
];

export const faqs = [
  {
    q: "ما هو وقت التوصيل المتوقّع؟",
    qEn: "What is the estimated delivery time?",
    a: "نوصّل طلبك خلال 10 إلى 30 دقيقة داخل المدينة، مع ضمان الطزاجة الكاملة.",
    aEn: "We deliver your order within 10 to 30 minutes within the city, with full freshness guaranteed.",
  },
  {
    q: "هل الحلويات طازجة يومياً؟",
    qEn: "Are the sweets made fresh daily?",
    a: "نعم، جميع منتجاتنا تُحضّر يومياً من أجود المكوّنات الطبيعية دون أي مواد حافظة.",
    aEn: "Yes, all our products are prepared daily from the finest natural ingredients with no preservatives.",
  },
  {
    q: "هل يمكنني تخصيص علبة إهداء؟",
    qEn: "Can I customize a gift box?",
    a: "بالتأكيد، يمكنك اختيار الأصناف والتغليف والبطاقة الخاصة عبر صفحة علب الإهداء.",
    aEn: "Absolutely — you can choose items, packaging, and a custom card via our gift boxes page.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    qEn: "What payment methods are available?",
    a: "نقبل الدفع نقداً عند الاستلام، والبطاقات البنكية، والمحافظ الإلكترونية.",
    aEn: "We accept cash on delivery, bank cards, and electronic wallets.",
  },
  {
    q: "هل تقدّمون منتجات خالية من المكسّرات؟",
    qEn: "Do you offer nut-free products?",
    a: "نعم، لدينا تشكيلة خاصة خالية من المكسّرات، ويُرجى مراجعة قسم مسبّبات الحساسية لكل منتج.",
    aEn: "Yes, we have a dedicated nut-free selection. Please check the allergens section on each product.",
  },
];

export const testimonials = baseReviews;

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
export function discountedPrice(p: Product) {
  return p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
}
