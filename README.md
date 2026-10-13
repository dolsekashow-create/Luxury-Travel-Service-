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

1. أنشئ رمز وصول من GitHub: **Settings ← Developer settings ← Fine-grained tokens ← Generate new token**.
   - Repository access: «Only select repositories» ثم مستودع الموقع فقط.
   - Permissions ← Repository permissions ← **Contents: Read and write**.
2. افتح `/admin/`، اكتب اسم المستودع بصيغة `owner/repo` والصق الرمز.
3. عدّل ما تريد، ثم اضغط **نشر التغييرات**. كل نشر = commit واحد في GitHub، وبعده يعيد Vercel بناء الموقع خلال دقيقة إلى دقيقتين.

لتثبيت اسم المستودع في شاشة الدخول اكتبه في `public/admin/config.json` (`"repo": "owner/repo"`).

الرمز يُحفظ في متصفحك فقط ولا يُرفع إلى أي مكان غير GitHub. من لا يملك رمزاً لا يستطيع تعديل أي شيء.

## التشغيل محلياً

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # الناتج في dist/
```

## النشر

المستودع مربوط بـ Vercel؛ أي push على الفرع الرئيسي ينشر الموقع. ملف `vercel.json` يحدد أن المشروع Astro وأن الناتج في `dist`.
