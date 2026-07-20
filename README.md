# نيرفانا للحلويات · NERVANA SWEETS

A world-class **luxury e-commerce** experience for an oriental sweets brand, built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Three.js**, **Framer Motion** and **GSAP**.

Arabic is the **default language** with full **RTL** support, and an instant **English / LTR** switcher. Metallic-gold-on-black luxury design, cinematic 3D hero, glassmorphism, floating golden particles, parallax and 60 FPS micro-interactions throughout.

---

## ✨ Getting started

```bash
npm install       # install dependencies
npm run dev       # start dev server → http://localhost:3000
npm run build     # production build
npm start         # run the production build
```

> Requires Node 18.17+ (Node 20+ recommended).

---

## 🎨 Brand system

| Token | Value |
| --- | --- |
| Metallic Gold | `#D4AF37` |
| Black | `#0B0B0B` |
| Dark Charcoal | `#1A1A1A` |
| Cream | `#F7F1E3` |
| Fonts | Playfair Display / Amiri (display) · Tajawal / Inter (body) |

All tokens live in `tailwind.config.ts` and `app/globals.css`.

---

## 🗺️ What's included

**Homepage** — cinematic Three.js hero, categories, featured products, best sellers, new arrivals, seasonal collections, offers (with live countdown + marquee), gallery, about us, customer reviews (with images), FAQ accordion, contact with **Google Maps**, newsletter, social links, floating **WhatsApp** button and **live chat** widget, plus recently-viewed rail.

**Shop** (`/products`) — AI-style smart search modal, advanced filters (category, price, rating, availability), sorting, product badges (New / Best Seller / Limited / Discount).

**Product page** (`/products/[id]`) — multi-image gallery with **hover zoom**, description / ingredients / allergens tabs, weight, price + discount, live availability & stock bar, rating, reviews with images, similar & related products, add-to-cart with quantity, wishlist, compare, share, estimated delivery time.

**Cart** (`/cart`) — quantity editing, removal, coupon codes (`NERVANA10`, `GOLD20`, `WELCOME15`), loyalty-points redemption, delivery fees, dynamic totals.

**Checkout** (`/checkout`) — full name, phone, complete address, street, building (optional), delivery notes → **order review** step → clear notice: _"Estimated delivery time: 10 to 30 minutes."_

**Order tracking** (`/order/[id]`) — animated pipeline **Pending → Preparing → Ready → Out for Delivery → Delivered**, auto-advancing demo status, **QR code** and downloadable **PDF invoice**.

**Account** (`/account`) — professional side panel: recent orders, purchase history, current order status, wishlist, favorites, loyalty points, coupons, notifications, personal profile, saved addresses, payment methods, recently purchased. Registration via **Email / Google / Phone** (mock auth). Includes an **admin-style exchange-rate control** for the **USD ⇄ SYP** currency switcher.

**Global** — fixed glass navbar with scroll animation and responsive mobile menu, language switcher (AR/EN with automatic RTL/LTR), currency switcher (USD/SYP, rate applied storewide), cart / wishlist / compare drawers, smart-search modal, auth modal.

---

## 🧱 Architecture

```
app/                      # App Router pages
  layout.tsx              # RTL default, fonts, providers, global chrome
  page.tsx                # homepage composition
  products/               # listing + [id] detail
  cart/ checkout/ account/ order/[id]/
components/
  Navbar · Footer · Chrome
  home/                   # hero (Three.js) + all homepage sections
  product/                # product detail
  commerce/               # drawers, modals, search, chat, order tracking
  ui/                     # ProductCard, SectionTitle, Stars, Particles
lib/
  i18n/dictionary.ts      # AR + EN strings
  data/products.ts        # mock catalogue, categories, reviews, FAQ
  stores/AppProvider.tsx  # language, currency, cart, wishlist, compare, auth, orders
  invoice.ts              # QR + PDF invoice generation
```

State is a single typed React context persisted to `localStorage`, so cart, wishlist, language, currency, account and orders survive refreshes.

---

## 🔌 Wiring it to a real backend

The storefront is fully functional on the front end with mock data. To go live, replace:

- `lib/data/products.ts` → your products/categories API
- `AppProvider` auth (`login`) → Google OAuth / OTP / email provider
- `placeOrder` → your orders endpoint (keep the QR + PDF helpers)
- Currency `sypRate` → pull from your Admin Dashboard setting
- WhatsApp number in `components/commerce/FloatingActions.tsx`
- Google Maps query in `components/home/Contact.tsx`

Product imagery uses Unsplash placeholders (configured in `next.config.mjs`); swap for your own product photography.

---

---

## 🔐 Hidden Admin Dashboard (enterprise)

A full management dashboard ships with the project. It is **never linked** from the storefront, footer or sitemap, and is **disallowed in `robots.ts`** + marked `noindex`.

**Secret URL:** `/control-a7x92k` → e.g. `http://localhost:3000/control-a7x92k`
(change the slug in `lib/admin/config.ts` before deploying).

**Demo login:**

- Username: `owner`
- Password: `Nervana@2026`
- 2FA code: `246810` (any 6 digits work in the demo)

Security model (client-side demo — wire to a real backend for production): username + password gate, **Two-Factor Authentication**, **session timeout** after 10 min inactivity, **device login history**, and **failed-attempt monitoring** (all under Settings → Security).

**Modules**

- **Overview** — total/daily/weekly/monthly/yearly revenue, order counts, product & user KPIs, conversion, AOV, 12-month revenue area chart, 7-day bar chart, order-status donut, best sellers, top customers, most viewed (charts are hand-rolled SVG — no external chart lib).
- **Products** — add / edit / delete / duplicate / bulk-edit, categories & subcategories, variants, weight, ingredients, allergens, images/video, badges, SEO, tags.
- **Inventory** — live stock, low/out-of-stock alerts, restock, "disable ordering at zero" toggle, inventory history, supplier notes.
- **Orders** — every field (customer, phone, address, items, prices, delivery, discount, coupon, payment method/status, status, driver, date, notes), search, filter, print, **CSV export**, status updates, cancel, refund, driver assignment. Real customer checkouts flow in automatically. **New-order toast + notification sound** (Web Audio) + a "Simulate order" button.
- **Customers** — view, search, ban, delete, reset password, purchase history, total spending, favorites, addresses, login history.
- **Employees** — CRUD with roles (admin / manager / driver) and a permissions system.
- **Content** — homepage/hero editor, banner & slider manager, gallery, FAQ editor, review moderation, contact info, social links.
- **Marketing** — coupons & discount codes, loyalty settings, referral program, seasonal & email campaigns, push notifications.
- **Currency** — set the USD⇄SYP rate and choose display mode (**USD only / SYP only / both**); applies instantly across the whole storefront.
- **Delivery** — fees, areas, delivery time, minimum order, free-delivery rules, working hours, manual close & maintenance mode. When closed, checkout is disabled and shows: _"We are currently closed. Orders will resume during business hours."_
- **Reports** — daily/weekly/monthly/yearly sales, product & customer reports, **PDF + Excel/CSV export**, print.
- **Notifications** — instant feed for new orders, cancellations, low stock, new users, reviews and contact messages.
- **Settings** — website name, logo, theme, homepage layout, contact, social, language, SEO, backups, maintenance mode, and the security panel.

Admin state is seeded deterministically and persisted to `localStorage` (keys prefixed `adm_` / `nv_`), so everything survives refreshes. The **Currency** and **Delivery/Store-hours** settings are shared live with the storefront through the same app state.

> To reset all demo data, clear the site's localStorage in your browser dev-tools.

---

---

## 🏗️ Production Stack (Part 3)

**Next.js 14 · React 18 · TypeScript · Tailwind · Three.js · GSAP · Framer Motion · PostgreSQL · Prisma · NextAuth · Docker · Vercel-ready.**

### Full setup with database

```bash
cp .env.example .env            # set DATABASE_URL + secrets
npm install                     # runs `prisma generate`
npx prisma migrate dev          # create the schema
npm run db:seed                 # seed roles, owner, catalogue, settings
npm run dev
```

Or one command with Docker (app + PostgreSQL):

```bash
docker compose up --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

Seed prints the owner login (`owner@nervana.sweets` / `Nervana@2026`) and a **2FA secret** to add to your authenticator app.

### Database (Prisma / PostgreSQL)

A professional relational schema in [`prisma/schema.prisma`](prisma/schema.prisma) covering: Users, Roles, Permissions, RolePermissions, Products, Categories, ProductImages, ProductVariants, Orders, OrderItems, Customers, Addresses, Coupons, LoyaltyTransactions, Notifications, Reviews, DeliveryZones, ExchangeRates, WebsiteSettings, AnalyticsEvents, AuditLogs, LoginHistory, Devices, Backups, plus the NextAuth adapter models (Account, Session, VerificationToken). Fully indexed, with enums and cascade rules.

### Security (enterprise-grade)

| Concern | Implementation |
| --- | --- |
| Password hashing | bcrypt cost 12 (`lib/security/password.ts`; Argon2 swap documented) |
| Auth | NextAuth (Credentials + Google), JWT sessions, 8h auto-expiry |
| 2FA | TOTP (RFC 6238) via otplib + QR enrolment (`lib/security/totp.ts`) |
| REST API auth | `jose` JWT (`lib/security/jwt.ts`) |
| RBAC | Roles → permissions, enforced in API + optional middleware (`lib/security/rbac.ts`) |
| Rate limiting | Token-bucket per-IP on `/api/*` (`lib/security/rateLimit.ts`; Upstash adapter noted) |
| CSRF | Double-submit token helper + NextAuth built-in |
| XSS / output | `escapeHtml` / `cleanInput`; CSP header |
| SQL injection | Prisma parameterised queries (no raw string SQL) |
| Input validation | Zod schemas on every route (`lib/validation/schemas.ts`) |
| CAPTCHA | reCAPTCHA v3 verification in the auth flow |
| Secure headers | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (`middleware.ts`) |
| Audit + login history + devices | Prisma tables, written on every sensitive action |
| Backups / restore | `scripts/backup.sh` (daily cron, 14-day rotation) + `scripts/restore.sh` |

### REST API

`app/api/*` route handlers: `products` (+`/[id]`), `orders` (+`/[id]`), `coupons/validate`, `currency`, `reviews`, `newsletter`, `search` (autocomplete), `recommendations` (AI), `analytics`, `health`, and NextAuth at `auth/[...nextauth]`. Every mutation validates input, checks RBAC, and writes an audit log. Order totals are **recomputed server-side** — client prices are never trusted.

### AI features

`lib/ai/recommend.ts`: popular-products detection, personalised suggestions (from a customer's category affinity), **frequently-bought-together** (order co-occurrence), and search autocomplete. Customer-behaviour events flow into the `AnalyticsEvent` table via `/api/analytics`.

### Performance

Standalone output, `next/image` optimisation, dynamic import of the 3D hero (`ssr:false`), code-splitting per route, skeleton loaders (`components/ui/Skeleton.tsx`), immutable cache headers on static assets, compression, `poweredByHeader` off, and 60 FPS GPU-friendly animations. Targets Lighthouse 95+ / green Core Web Vitals.

### SEO

`app/sitemap.ts` (XML sitemap), `app/robots.ts` (admin disallowed), per-product `generateMetadata` (dynamic title/description/canonical/OG/Twitter), Schema.org JSON-LD for Organization, WebSite, Product and BreadcrumbList (`lib/seo/schema.ts`), auto alt text on product images, clean URLs.

### PWA

`public/manifest.webmanifest` + generated icons, service worker (`public/sw.js`) with offline fallback (`/offline`), stale-while-revalidate caching, background sync and push-notification handlers, and a tasteful install prompt (`components/pwa/RegisterSW.tsx`).

### Accessibility (WCAG 2.2)

Skip-to-content link, visible `:focus-visible` rings, `prefers-reduced-motion` and `prefers-contrast` support, semantic landmarks, `aria-*` on interactive controls, accessible forms and labels.

### Animations

Cinematic 3D hero, page transitions (`app/template.tsx`), animated counters (`components/ui/Counter.tsx`), skeleton loaders, success/error micro-animations (`components/ui/Feedback.tsx`), premium hover/scroll effects and floating elements throughout.

### Deployment

- **Vercel**: push the repo, set env vars, `vercel.json` handles the build (`prisma migrate deploy && next build`) and security/cache headers.
- **Docker**: multi-stage `Dockerfile` (standalone runtime, non-root user, healthcheck) + `docker-compose.yml` (app + Postgres).

> **Demo vs. production data:** the storefront and admin currently render from a rich in-memory demo dataset (`lib/data`, `lib/admin`) so everything works instantly with zero setup. The Prisma schema, REST API, auth and security layer above are the production data path — point the UI hooks at the API routes (they already return the same shapes) to go fully database-backed. This keeps the demo runnable while giving you a real backend to grow into.

---

---

## 🔑 Authentication, Media & Advanced Admin (Part 4)

### Authentication system

Luxury black-&-gold auth screens under `/auth/*` (chrome-less, animated):

| Page | Flow |
| --- | --- |
| `/auth/login` | Email + password (+ optional 2FA), Google, or phone |
| `/auth/register` | Email sign-up → verification email |
| `/auth/phone` | Phone number → OTP → sign in |
| `/auth/forgot-password` | Request a reset link (no account enumeration) |
| `/auth/reset-password` | Set a new password from an emailed token |
| `/auth/verify-email` | Confirm email from the link |

Backed by NextAuth (Credentials + Google + a dedicated **phone-OTP** provider) and REST routes under `app/api/auth/*`: `register`, `verify-email`, `forgot-password`, `reset-password`, `otp/request`, `otp/verify`, `change-password`, `logout-all`. Tokens are hashed at rest, OTP codes are bcrypt-hashed with attempt limits, and **“log out from all devices”** bumps a `tokenVersion` that invalidates every existing JWT. Emails and SMS use pluggable adapters (`lib/mail.ts` SMTP/nodemailer, `lib/sms.ts` Twilio) that log to the console in dev when unconfigured.

The **account area** gains a full profile experience: change profile picture, edit info, change password, manage saved delivery addresses, and sign out everywhere — wired to `app/api/profile` and `app/api/addresses` for production, and working live in the demo via app state.

### Admin · Pricing Management

`/control-a7x92k/pricing`: inline USD price editing, **bulk price edit** (set / increase % / decrease %), per-product discounts, **scheduled discounts** (date window), and **restore original price** — with the **SYP equivalent calculated automatically** from the exchange rate and updated storewide.

### Admin · Media Manager

`/control-a7x92k/media`: a professional media library with folders (product images, category icons, banners, promotional, gallery, website assets), **drag-&-drop multi-upload**, **preview-before-publish** with editable filename + alt text, inline rename / alt-editing / folder-move / replace / delete, copy-URL, and search.

### Image optimization pipeline

`lib/media/optimize.ts` (sharp) runs on every upload via `POST /api/media/upload`:

- Compress and **convert to WebP** (near-lossless).
- Generate **responsive sizes** (320 / 640 / 1024 / 1600).
- Produce a tiny **blur placeholder (LQIP)** to prevent layout shift.
- Persist to storage (filesystem here; swap `store()` for S3 / Vercel Blob / R2 — all CDN-ready) and record dimensions, size, variants and alt text in the `MediaAsset` table.

Delivery uses **next/image** configured (`next.config.mjs`) for AVIF→WebP, a full responsive-size ladder, lazy-loading, and a 30-day `minimumCacheTTL` so returning visitors never re-download unchanged images. Important homepage imagery is `priority`-preloaded; galleries stay smooth via lazy-loading and cached variants.

### New database models

`EmailVerificationToken`, `PasswordResetToken`, `PhoneOtp`, `MediaAsset` (with `MediaFolder` enum), plus `User.tokenVersion` / `phoneVerified` and scheduled-price fields on `Product` (`originalPriceUsd`, `discountStartsAt`, `discountEndsAt`).

---

---

## 🤖 Automation, AI & Telegram (Part 5)

### Telegram bot

A secure admin bot (`lib/telegram/bot.ts`). On every new order it sends the admin a message with the **order number, customer, phone, address, items, quantities, total, payment & delivery status, and exact date/time**, plus inline buttons: **Accept / Reject / Preparing / Ready / Out for Delivery / Delivered**. Button taps hit `POST /api/telegram/webhook` (secret-token verified) and **update the order in the database instantly**. Register once via `POST /api/telegram/set-webhook`. Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`.

### Exchange-rate automation

`lib/exchange/provider.ts` polls a trusted provider (default `open.er-api.com`, no key). The cron endpoint `GET /api/cron/exchange-rate` runs **every minute** (Vercel cron in `vercel.json`): on change it saves a new `ExchangeRate` row (full history), Telegram-notifies the admin, and — because prices are stored in USD and rendered through the live rate — **every product price updates automatically**. If the source is unavailable it keeps the **last saved rate** and alerts the admin. The admin Currency page shows the **last-update time**, a **Sync now** button, and **manual override**.

### AI assistant

A luxury concierge widget (`components/ai/Assistant.tsx`) backed by `POST /api/ai/chat`. It answers questions, **recommends products**, **suggests gifts**, **explains ingredients/allergens**, and **guides checkout** — rendering tappable product cards with add-to-cart. Works out of the box via an on-site catalogue engine (`lib/ai/assistant.ts`), and upgrades to an LLM (OpenAI or Anthropic) when `AI_PROVIDER` + `AI_API_KEY` are set.

### Web push notifications

VAPID web push (`lib/push/webpush.ts`, service-worker handlers already in `public/sw.js`). Customers opt in (`components/push/PushOptIn.tsx`, in the account area) to topics: **offers, discounts, new products, order updates**. `POST /api/push/subscribe` stores the subscription; `POST /api/push/send` broadcasts campaigns (RBAC); order status changes push directly to the customer. Generate keys with `npx web-push generate-vapid-keys`.

### Auto-save & edit history

The admin dashboard **auto-saves every change** to storage and **recovers unsaved work after a refresh** (all state is persisted). The topbar shows a live "Saved" indicator, and an **edit history** is kept in the admin context.

### Advanced analytics

`/control-a7x92k/analytics`: **live visitor** counter, **activity heatmap** (day × hour), **best-selling hours & days**, **sales prediction** (trend projection), **conversion funnel**, **customer retention / returning customers**, **average session duration**, and **most-clicked products**.

### System monitoring

`/control-a7x92k/system` polls `GET /api/system/metrics` (real Node/OS metrics): **CPU, memory, storage, database health & latency, uptime, failed-login count, and error logs**.

### Backup system

`/control-a7x92k/backups`: **automatic daily backups** (`/api/cron/backup`), **manual backup** (`POST /api/backups` → `scripts/backup.sh`), **one-click restore** (`scripts/restore.sh`), **cloud-backup** toggle, and 14-day rotation.

### New env & models

`PushSubscription` model; env for Telegram, exchange provider, `CRON_SECRET`, VAPID keys, and the optional AI provider — all in `.env.example`. Cron endpoints are protected by `CRON_SECRET` (or the Vercel cron header).

---

---

## 📡 Telegram Channel Exchange-Rate Automation (Part 6)

The admin's Telegram channel — **[@SaymouaaExchange](https://t.me/SaymouaaExchange)** (سعر الصرف في جبل الباشان) — continuously publishes the USD→SYP rate. The system monitors it and drives pricing across the whole site.

**How it works.** Add the bot as an **admin of the channel**. Every new post arrives at `POST /api/telegram/webhook` as a `channel_post`. The pipeline (`lib/exchange/provider.ts → ingestRateFromText`):

1. **Detect** the new message and **extract** the rate with `lib/exchange/parse.ts` — handles Arabic-Indic & Eastern-Arabic digits (`١٥٠٠٠` / `۱۵۰۰۰`), thousands separators, and buy/sell pairs (averaged).
2. **Validate** the value against sane bounds (`EXCHANGE_MIN`/`MAX`) and a max-jump guard (`EXCHANGE_MAX_JUMP`) — bad messages are rejected and the admin is alerted.
3. **Persist** a new `ExchangeRate` row (with `source` + original `rawMessage`) — full history is kept.
4. **Update site-wide**: prices stay stored in **USD**; a background poller in the app state pulls the latest rate at the configured interval and **recalculates every SYP price and shopping-cart total instantly**.
5. **Record** the exact date/time and **notify** the admin on Telegram.

**Exchange dashboard** (`/control-a7x92k/currency`): current rate + source + last-update time, **highest/lowest recorded**, **daily / weekly / monthly** history charts, a **connection-status badge with a warning banner** when the channel is unreachable, complete **rate logs with one-click restore**, and a **"simulate channel message"** box that runs the real parser client-side so you can see extraction live.

**Admin controls.** Enable/disable auto-sync, choose the interval (**30s / 1m / 5m**), edit the rate manually at any time, restore any previous rate, and view the full log. Config persists via `GET/PATCH /api/exchange/config`; history via `GET /api/exchange/history`.

**Reliability.** No new message → the last valid rate keeps running. Connection failure → last saved rate stays in effect, a dashboard warning shows, and the admin is notified. A health cron (`/api/cron/telegram-rate`, every minute) verifies channel connectivity via `getChat` and alerts on failure. Sync runs in the background with negligible overhead (event-driven webhook + a light poller).

**Full Telegram notifications** now fire for: new order, order cancelled, order delivered, low stock, out of stock, new customer, new review, exchange-rate updated, Telegram connection failure, and system errors (wired through the API error handler).

---

---

## 🔔 Push Notifications & Premium Notification UX (Part 7)

**Polite opt-in.** A soft prompt (`components/push/SoftPrompt.tsx`) appears **after ~15s on site** (or ~3s once signed in) — never an aggressive immediate request. It only shows when permission is still `default`, remembers dismissal, and subscribes via the shared `lib/push/client.ts` helper.

**Real-time customer notifications** fire across the full lifecycle and marketing events: order received, accepted/preparing, ready, out for delivery, delivered, cancelled, **payment confirmed**, plus new discounts, new products, seasonal offers, loyalty points earned, coupon-expiry reminders, birthday offers, favorite/product **back in stock**, flash sales and limited-time offers. Order-stage notifications are wired directly into the cart/tracking flow (`placeOrder` + `advanceOrder` in the app state).

**Elegant in-app toasts** (`components/notifications/Toaster.tsx`): animated, per-kind iconography and colour, auto-dismiss, stacked top-corner, with an **optional notification chime** (Web Audio) that respects the user's sound setting.

**Notification Center** (`components/notifications/NotificationCenter.tsx`): a bell in the navbar (with an unread badge) opens a drawer listing **every past notification with date, time and relative age**, read/unread state, deep-links, mark-all-read and clear.

**Account controls.** The account → Notifications tab lets customers **enable/disable browser push**, pick topics (orders & payments, discounts & flash sales, new products, seasonal & loyalty), **toggle notification sounds**, fire **sample notifications** to preview each type, and jump to the center.

**Admin notifications** (from Parts 5–6) already deliver instant Telegram + in-dashboard alerts for new orders, cancellations, new users, low/out-of-stock, new reviews, contact messages and system errors.

All notification state persists (recovered on refresh); the browser-push topics map to the same server subscription topics used by `POST /api/push/send`.

---

---

## ✨ Luxury Experience: 3D Intro, AI & Countdowns (Part 8)

### Cinematic 3D welcome intro

A breathtaking first-visit overlay (`components/intro/WelcomeIntro.tsx`) — a golden oriental sweet slowly rotating under warm cinematic lighting, real metal reflections (PMREM environment), floating golden particles, depth-of-field fog and a smooth camera dolly — that plays for a few seconds then fades seamlessly into the homepage. It's **remembered per visitor** (browser storage) so it won't replay unless they hit **"Replay intro"** in the footer. Admins can (in Content Management) **enable/disable** it, **change its duration**, pick a **holiday scene** (Default / Eid / Ramadan / Wedding), or point it at a **custom `.glb/.gltf` 3D model** for special events.

### AI shopping assistant (upgraded)

The site-wide concierge now recommends by **occasion** (wedding, birthday, Eid, Ramadan, graduation, hospitality, gifts), by **budget** ("under $30"), surfaces **best sellers** and **luxury gift boxes**, **compares products**, explains **ingredients & allergens**, suggests **similar items**, and helps **complete orders** — in **Arabic (default) and English**, with one-tap occasion chips. Works on-device via `lib/ai/assistant.ts`, upgradable to an LLM.

### Premium countdown promotions

A full campaign system (managed at `/control-a7x92k/promotions`): create **unlimited** campaigns with **scheduled start/end**, a discount, linked products, a coupon, and **placements** (homepage, product pages, banner, popup). Countdowns (`components/promo/Countdown.tsx`) show **days / hours / minutes / seconds** with luxury flip animations and **auto-end** on expiry; expired promos **auto-disable** and prices revert to their originals. The homepage hero-strip (`PromoSection`) and a timed **promotional popup** (`PromoPopup`) surface live offers; claiming a promo fires a **golden confetti celebration** (`components/ui/Confetti.tsx`), applies the coupon, and pushes a **real-time notification**. New campaigns broadcast an instant "new promotion available" notification to shoppers.

Every one of these — intro, assistant, and countdowns — is wired into the same app state, persists across refreshes, and runs live in the demo with zero backend.

---

---

## 🌙 Seasonal Themes, Immersive 3D & Cinematic Motion (Part 9)

### Immersive 3D background

A subtle, site-wide living background (`components/three/AmbientBackground.tsx`): floating golden dust and slowly-rotating Arabic-geometric wireframe ornaments, **mouse-parallax camera**, tinted to the active seasonal accent. It's engineered to stay out of the way — capped device-pixel-ratio, sparse geometry, `low-power` GPU hint, **pauses when the tab is hidden**, dynamically imported (`ssr:false`), and **fully removed in reduced-motion mode**.

### Seasonal theme engine

A complete theme system in the app state. Admins (`/control-a7x92k/themes`) can **schedule** and **activate** themes for **Ramadan, Eid Al-Fitr, Eid Al-Adha, Mother's Day, Valentine's, Graduation, Summer, Winter, New Year, National Day and Custom events**. Each theme drives, live across the site, the **accent colours, particle colour, 3D-ornament tint, hero tagline, banners and countdown accents** — applied via CSS variables + a `data-theme` attribute on `<html>`, resolved automatically by schedule (with a manual override). Admins can edit colours, ornament motif, taglines, schedule windows and **upload custom hero assets** per theme.

### Reduced-motion / performance mode

A one-tap toggle (footer, and honoured from the OS `prefers-reduced-motion`) that **drops the 3D background and heavy animations while preserving the premium look** — great for low-power devices. Driven by a `data-reduced` attribute + CSS, and respected by the animation components.

### More cinematic animations

On top of the existing page transitions, scroll reveals, animated counters, skeletons, confetti and 3D hero/intro, Part 9 adds reusable primitives: **magnetic buttons** (`MagneticButton`), **ripple buttons** (`RippleButton`), and a **luxury loading screen** (`LoadingScreen`) — all reduced-motion aware.

### Interactive homepage

The homepage now also includes an **animated Instagram gallery** (`@nervana.sweets`) alongside the animated hero, 3D sweets, live promo strip + countdown, AI recommendations, best-seller & new-arrival showcases, animated statistics, testimonials, and smooth section transitions.

All effects target 60 FPS and degrade gracefully via lazy-loading, dynamic imports, AVIF/WebP optimization and the reduced-motion path.

---

---

## 🎧 Premium Luxury Audio Experience (Part 10)

A self-contained **Web Audio synthesis engine** (`lib/audio/engine.ts`) delivers the entire audio experience with **zero audio files** — tiny, instant, browser-friendly — while admins can override any sound with uploaded URLs for production.

**Cinematic intro soundtrack** — when the 3D welcome plays, a layered orchestral swell (rising pads + an ascending golden chime arpeggio) is triggered and **timed to the intro's duration**, synced with the camera dolly and lighting.

**Ambient background** — a calm, elegant, **non-repetitive** pad that slowly wanders a pentatonic palette through a soft reverb, with occasional **spatially-panned chimes** — luxurious and minimal, never distracting.

**Interactive sound effects** — subtle, professionally-enveloped cues wired throughout: hover, click, open/close menus, open cart, add/remove product, apply coupon, notifications, login, order confirmed, payment success, and AI-assistant interactions.

**Floating audio controller** (`components/audio/AudioController.tsx`) — a luxury black-&-gold control to **enable/disable all sound**, toggle **music** and **sound-FX independently**, and adjust **each volume**, with preferences **remembered across visits**.

**Autoplay-safe** — nothing sounds until a gesture: SFX prime on the first interaction, and background music waits behind a **beautiful animated "Activate premium audio" button**. **Performance-safe** — pure synthesis (no downloads/preloads); uploaded URLs stream with `preload="none"` and browser caching; music pauses when the tab is hidden.

**Admin audio manager** (`/control-a7x92k/audio`) — upload/replace **background, seasonal and promotional music** and **UI sound effects** (with preview before publishing), set **default volumes**, and **schedule seasonal playlists** that auto-play with the matching theme (Ramadan, Eid, New Year, custom campaigns).

---

---

## 🌅 Dynamic Day & Night Experience (Part 11)

The site is **alive with the visitor's local time**, transitioning cinematically between four moods:

- **Morning** — soft golden sunrise glow, warm hero lighting, gentle particles.
- **Day** — bright premium lighting, crystal reflections, vibrant gold highlights.
- **Sunset** — warm orange & gold gradients, elegant glow, slow floating particles.
- **Night** — deep luxury black with an animated **star field**, cool cinematic hero light, golden glow.

**What adapts, automatically:** the layered **environment sky** (`components/three/EnvironmentLayer.tsx`) crossfades between four gradient skies over ~2.6s (with a CSS star field at night); the **3D hero lighting & background** (`Hero3D`) shift colour, intensity and exposure per period; the **ambient dust** re-tints and changes pace; the **accent** (`--daypart-accent`) updates; and the **ambient audio tone crossfades** (warmer at night, brighter by day) via the audio engine's `setMood`. Transitions are smooth and nearly unnoticeable, and everything stays GPU-light (CSS-composited skies, capped-DPR canvases, reduced-motion aware).

**Admin controls** (`/control-a7x92k/environment`): enable/disable the mode, **override & preview** any period (Force Morning / Day / Sunset / Night, or Auto-by-time), and tune **lighting intensity** and **animation intensity** — all live.

### 📱 Mobile harmony

Fully responsive across desktop, tablet and mobile: adaptive grids everywhere, a slide-in mobile navigation drawer, decluttered navbar icons on small screens, repositioned floating controls (audio, chat, WhatsApp, prompts) so they never collide, horizontally-scrollable admin tables, and touch-friendly targets — all while keeping the 60 FPS luxury feel.

---

Built as a premium, international-grade luxury storefront. Enjoy 🍯
