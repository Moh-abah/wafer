# دليل النشر — Deployment Guide

---

## نظرة عامة | Overview

مشروع وفر هو تطبيق Next.js واحد يُخدم عبر **ثلاثة نطاقات (domains)**:

| النطاق Domain | الغرض Purpose | المسار Route Group |
|---|---|---|
| `wafir.gleeze.com` | البوابة العامة للعملاء | `(public)` → `/`, `/facilities`, `/register` |
| `admin.wafir.gleeze.com` | لوحة تحكم الإدارة | `(admin)` → `/admin/*` |
| `facility.wafir.gleeze.com` | بوابة المالكين | `(owner)` → `/owner/*` |

The Wafir project is a single Next.js application served across **three domains**. All domains point to the same Vercel deployment, and Next.js route groups handle the different interfaces.

---

## ١. إعداد Vercel | Vercel Setup

### إنشاء المشروع | Create the Project

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل الدخول
2. اضغط **"Add New"** → **"Project"**
3. اختر مستودع GitHub الذي يحتوي على الكود
4. في إعدادات المشروع، تأكد من:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`
   - **Output Directory**: `.next` (تلقائي)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Select the GitHub repository containing the code
4. In project settings, ensure:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`
   - **Output Directory**: `.next` (automatic)

> **ملاحظة مهمة**: Vercel يحتاج دعم Bun. إذا لم يعمل `bun` تلقائيًا، استخدم:
> **Important Note**: Vercel needs Bun support. If `bun` doesn't work automatically, use:
>
> - Build Command: `npx next build`
> - Install Command: `npm install`

---

## ٢. سجلات DNS | DNS Records

لكل نطاق، أضف السجل المناسب في مزوّد DNS:

For each domain, add the appropriate record in your DNS provider:

### wafir.gleeze.com (النطاق الرئيسي | Primary Domain)

| النوع Type | الاسم Name | القيمة Value |
|---|---|---|
| CNAME | `wafir` | `cname.vercel-dns.com` |

> إذا لم يدعم مزوّد DNS الـ CNAME على الجذر، استخدم سجل A:
> If your DNS provider doesn't support CNAME at the root, use an A record:
>
> | النوع Type | الاسم Name | القيمة Value |
> |---|---|---|
> | A | `@` | `76.76.21.21` |

### admin.wafir.gleeze.com

| النوع Type | الاسم Name | القيمة Value |
|---|---|---|
| CNAME | `admin` | `cname.vercel-dns.com` |

### facility.wafir.gleeze.com

| النوع Type | الاسم Name | القيمة Value |
|---|---|---|
| CNAME | `facility` | `cname.vercel-dns.com` |

> **انتظر انتشار DNS** — قد يستغرق من دقائق إلى 48 ساعة
> **Wait for DNS propagation** — can take minutes to 48 hours

---

## ٣. إعداد النطاقات في Vercel | Custom Domain Configuration

بعد إنشاء المشروع في Vercel:

After creating the project on Vercel:

1. اذهب إلى **Project Settings** → **Domains**
2. أضف النطاقات الثلاثة:
   - `wafir.gleeze.com`
   - `admin.wafir.gleeze.com`
   - `facility.wafir.gleeze.com`
3. تأكد من تفعيل **"Redirect to www"** إذا أردت (اختياري)
4. Vercel سيُصدّر شهادة SSL تلقائيًا لكل نطاق

1. Go to **Project Settings** → **Domains**
2. Add the three domains:
   - `wafir.gleeze.com`
   - `admin.wafir.gleeze.com`
   - `facility.wafir.gleeze.com`
3. Optionally enable **"Redirect to www"**
4. Vercel will automatically provision SSL certificates for each domain

---

## ٤. متغيرات البيئة | Environment Variables

في **Project Settings** → **Environment Variables** أضف:

In **Project Settings** → **Environment Variables** add:

| المتغير Variable | القيمة Value | البيئة Env |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.wafir.gleeze.com/api/v1` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://wafir.gleeze.com` | Production, Preview, Development |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.wafir.gleeze.com` | Production |
| `NEXT_PUBLIC_OWNER_URL` | `https://facility.wafir.gleeze.com` | Production |

> **ملاحظة**: للبيئات Preview و Development، استخدم عناوين Vercel التلقائية:
> **Note**: For Preview and Development environments, use Vercel auto-generated URLs:
>
> - `NEXT_PUBLIC_SITE_URL` = `https://your-project.vercel.app`
> - `NEXT_PUBLIC_ADMIN_URL` = `https://your-project.vercel.app`
> - `NEXT_PUBLIC_OWNER_URL` = `https://your-project.vercel.app`

---

## ٥. متطلبات CORS | CORS Requirements

الباك إند (API) يجب أن يسمح بالوصول من النطاقات الثلاثة. راجع **BLOCKERS.md** للمشكلة المسجلة.

The backend API must allow access from all three domains. See **BLOCKERS.md** for the logged issue.

### الأصول المطلوبة | Required Origins

```
https://wafir.gleeze.com
https://admin.wafir.gleeze.com
https://facility.wafir.gleeze.com
```

### الإعدادات المطلوبة | Required Settings

- **Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Headers**: `Authorization`, `Content-Type`
- **Special**: يجب دعم `multipart/form-data` (لاستيراد ملفات Excel)
- **Special**: Must support `multipart/form-data` (for Excel file imports)

---

## ٦. أمر البناء | Build Command

```bash
bun run build
```

أو إذا لم يكن Bun مدعومًا في بيئة النشر:

Or if Bun is not supported in the deployment environment:

```bash
npx next build
```

### متطلبات البنية | Build Requirements

- **Node.js**: 18.x أو أحدث
- **Bun**: 1.x (مُفضّل لسرعة التثبيت)
- **Runtime**: Node.js (لا تُفعّل Edge Runtime)

---

## ٧. التحقق من النشر | Post-Deployment Verification

بعد النشر، تحقق من التالي:

After deployment, verify the following:

- [ ] `https://wafir.gleeze.com` — الصفحة الرئيسية تعمل
- [ ] `https://wafir.gleeze.com/facilities` — صفحة المرافق
- [ ] `https://wafir.gleeze.com/register` — صفحة التسجيل
- [ ] `https://admin.wafir.gleeze.com/admin` — لوحة تحكم الإدارة
- [ ] `https://facility.wafir.gleeze.com/owner` — بوابة المالكين
- [ ] `https://wafir.gleeze.com/sitemap.xml` — خريطة الموقع
- [ ] `https://wafir.gleeze.com/robots.txt` — إعدادات الزواحف
- [ ] `https://wafir.gleeze.com/manifest.webmanifest` — ملف التطبيق
- [ ] SSL نشط على كل النطاقات
- [ ] الاتصال بالـ API يعمل (تحقق من استجابة الشبكة في DevTools)

---

## ٨. استكشاف الأخطاء | Troubleshooting

### مشكلة: الصفحة تُظهر 404 على نطاق فرعي
**Problem**: Page shows 404 on a subdomain

**الحل Solution**: تأكد أن النطاق مُضاف في إعدادات Vercel وأن DNS يُشير إلى `cname.vercel-dns.com`

### مشكلة: أخطاء CORS في المتصفح
**Problem**: CORS errors in the browser

**الحل Solution**: راجع **BLOCKERS.md** — الباك إند يحتاج إعداد CORS للأصول الثلاثة. هذا يتطلب تعديل من جانب الباك إند.

### مشكلة: الصور لا تظهر
**Problem**: Images don't load

**الحل Solution**: تأكد أن `api.wafir.gleeze.com` مُضاف في `remotePatterns` في `next.config.ts` (مُعدّل مسبقًا).

### مشكلة: خطأ في البناء
**Problem**: Build error

**الحل Solution**: شغّل `bun run build` محليًا لرؤية الأخطاء. تأكد أن كل الـ types محددة ولا يوجد `any` غير مصرح به.
