# 🚂 نشر NERVANA SWEETS على Railway

دليل خطوة بخطوة لاستضافة الموقع على [railway.app](https://railway.app) — Next.js + PostgreSQL + Prisma.
كل شيء مُهيّأ مسبقاً في `railway.json` (البناء + `prisma db push` + التشغيل + فحص الصحة).

> ⚠️ **مهم جداً — سببان شائعان لفشل النشر:**
> 1. **البنّاء (Builder):** لازم يكون **Nixpacks** وليس Dockerfile. لهذا نقلنا الـ Dockerfile إلى مجلّد `deploy/` حتى لا يلتقطه Railway. إذا ظهر عندك «Builder: Dockerfile»، روح **Service → Settings → Build → Builder → اختر Nixpacks**.
> 2. **المتغيّرات وقاعدة البيانات:** إذا رأيت «0 Variables»، فأنت لم تُضِف قاعدة بيانات ولا المتغيّرات بعد — نفّذ الخطوتين ٢ و٣ أدناه قبل النشر.

---

## 1) ارفع الكود إلى GitHub

```bash
cd nervana-sweets
git init
git add .
git commit -m "NERVANA SWEETS"
# أنشئ مستودعاً فارغاً على GitHub ثم:
git remote add origin https://github.com/<username>/nervana-sweets.git
git branch -M main
git push -u origin main
```

> بديل بدون GitHub: ثبّت Railway CLI (`npm i -g @railway/cli`)، ثم `railway login` و `railway init` و `railway up`.

---

## 2) أنشئ المشروع + قاعدة البيانات

1. افتح Railway → **New Project** → **Deploy from GitHub repo** → اختر المستودع.
2. داخل نفس المشروع: **New** → **Database** → **PostgreSQL**.
   Railway سيوفّر متغيّر `DATABASE_URL` لقاعدة البيانات تلقائياً.

---

## 3) متغيّرات البيئة (Variables)

في خدمة الويب (الـ Service) → تبويب **Variables** → أضِف:

| المفتاح | القيمة |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (مرجع لقاعدة بيانات Railway) |
| `NEXTAUTH_SECRET` | نصّ عشوائي طويل — ولّده بـ `openssl rand -base64 32` |
| `JWT_SECRET` | نصّ عشوائي طويل آخر |
| `NEXTAUTH_URL` | رابط تطبيقك، مثل `https://nervana.up.railway.app` |
| `NEXT_PUBLIC_SITE_URL` | نفس الرابط أعلاه |

**اختياري** (المزايا تعمل بدونها وتتفعّل عند إضافتها):
`GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `TELEGRAM_BOT_TOKEN` · `TELEGRAM_ADMIN_CHAT_ID` · `TELEGRAM_RATE_CHANNEL` (=`@SaymouaaExchange`) · `TELEGRAM_WEBHOOK_SECRET` · `CRON_SECRET` · `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `SMTP_*` · `AI_PROVIDER`+`AI_API_KEY`.
(كل الأسماء موجودة في `.env.example`.)

> ملاحظة: لا تضبط `PORT` — Railway يديره تلقائياً و Next.js يقرأه.

---

## 4) انشر (Deploy)

Railway سيقرأ `railway.json` وينفّذ تلقائياً:

- **Build:** `npm run build` (يشمل `prisma generate` + `next build`)
- **Start:** `npx prisma db push` (ينشئ كل الجداول من `schema.prisma`) ثم `npm run start`
- **Health check:** `/api/health`

عيّن دومين: **Settings → Networking → Generate Domain**، ثم حدّث `NEXTAUTH_URL` و `NEXT_PUBLIC_SITE_URL` بهذا الرابط.

---

## 5) تعبئة البيانات الأولية (Seed) — مرّة واحدة

بعد نجاح أول نشر، شغّل التعبئة مرّة واحدة لإنشاء الأدوار والمالك والقائمة:

```bash
# باستخدام Railway CLI بعد الربط (railway link):
railway run npm run db:seed
```

سيطبع بيانات المالك:
- **owner@nervana.sweets** / **Nervana@2026** (+ سرّ 2FA لإضافته إلى تطبيق المصادقة)

> لوحة الأدمن السرّية: `https://<domain>/control-a7x92k`
> (غيّر المسار السرّي من `lib/admin/config.ts` قبل الإطلاق الحقيقي.)

---

## ✅ نصائح

- **الموقع يعمل مباشرة** حتى قبل الـ seed (الواجهة تستخدم بيانات تجريبية)؛ الـ seed يفعّل المسار الحقيقي لقاعدة البيانات.
- **الترقية للـ migrations لاحقاً:** استبدل `prisma db push` في `railway.json` بـ `prisma migrate deploy` بعد توليد ملفات migrations محلياً (`npx prisma migrate dev`).
- **المهام المجدولة (Cron)** لسعر الصرف والنسخ الاحتياطي: أضِفها من Railway **Cron** على المسارات `/api/cron/telegram-rate` و`/api/cron/exchange-rate` و`/api/cron/backup` مع ترويسة `Authorization: Bearer <CRON_SECRET>`.
- **رفع الصور** (`/api/media/upload`) يكتب على القرص المحلي؛ على Railway استخدم تخزيناً دائماً (Volume) أو خدمة تخزين خارجية (S3/R2) للإنتاج.
