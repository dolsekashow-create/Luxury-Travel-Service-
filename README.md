# Luxury Travel Service — الموقع ولوحة التحكم

موقع ثابت (Astro) بالعربية والإنجليزية. كل المحتوى محفوظ داخل هذا المستودع، ولا توجد قاعدة بيانات.

## أين يوجد المحتوى؟

| الملف | المحتوى |
|---|---|
| `src/data/settings.json` | نصوص الواجهة، من نحن، بيانات التواصل، السوشيال |
| `src/data/programs.json` | البرامج والرحلات اليومية |
| `src/data/services.json` | الخدمات |
| `public/media/` | الصور والفيديو (كل صورة بمقاسين: `name.webp` و `name.sm.webp`) |

## لوحة التحكم

الرابط: `/admin/` على نفس الموقع.

الدخول بكلمة سر. كلمة السر ورمز GitHub محفوظان في إعدادات Vercel (وليس في الكود)، والدالة `api/gh.js` تتحقق من كلمة السر ثم تنفّذ طلبات GitHub بالنيابة عن اللوحة.

### الإعداد (مرة واحدة)

1. أنشئ رمز وصول من GitHub: **Settings ← Developer settings ← Fine-grained tokens ← Generate new token**.
   - Repository access: «Only select repositories» ثم مستودع الموقع فقط.
   - Permissions ← Repository permissions ← **Contents: Read and write**.
2. في Vercel: **Project ← Settings ← Environment Variables** أضف:
   - `ADMIN_PASSWORD` = كلمة السر التي ستعطيها للعميل (اجعلها طويلة).
   - `GITHUB_TOKEN` = الرمز من الخطوة 1.
3. من **Deployments** اختر آخر نشر ثم **Redeploy** حتى تُقرأ المتغيرات.

### الاستخدام

افتح `/admin/`، اكتب كلمة السر، عدّل ما تريد، ثم اضغط **Publish Changes**. كل نشر = commit واحد في GitHub، وبعده يعيد Vercel بناء الموقع خلال دقيقة إلى دقيقتين.

لتغيير كلمة السر: عدّل `ADMIN_PASSWORD` في Vercel ثم Redeploy؛ كل الجلسات القديمة تنتهي تلقائياً.

للمطوّر: في شاشة الدخول خيار «Developer: sign in with a GitHub token» للدخول برمز شخصي مباشرة دون كلمة السر.

## التشغيل محلياً

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # الناتج في dist/
```

## النشر

المستودع مربوط بـ Vercel؛ أي push على الفرع الرئيسي ينشر الموقع. ملف `vercel.json` يحدد أن المشروع Astro وأن الناتج في `dist`.
