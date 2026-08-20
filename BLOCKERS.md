# BLOCKERS.md — Backend Issues Requiring Action

## Critical

### 1. نقطة دخول المالك غير موجودة (POST /api/v1/owner/login)
- **المسار المتوقع**: `POST /api/v1/owner/login`
- **الحالة**: غير موجود في OpenAPI (تم فحص openapi.json بتاريخ المشروع)
- **التأثير**: بوابة المالك لا يمكنها تسجيل الدخول
- **المطلوب**: إضافة نقطة دخول بذات شكل `/api/v1/admin/login` (طلب `{identifier, password}` ← استجابة `{access_token, token_type}`)
- **ملاحظة**: الـ JWT يجب أن يحتوي على `role: "owner"` في الـ claims

### 2. CORS غير مُفعّل للأصول الثلاثة
- **الأصول المطلوبة**:
  - `https://wafir.gleeze.com`
  - `https://admin.wafir.gleeze.com`
  - `https://facility.wafir.gleeze.com`
- **Methods**: GET, POST, PUT, PATCH, DELETE
- **Headers**: Authorization, Content-Type
- **ملاحظة**: multipart/form-data (استيراد Excel) يجب السماح به

## Medium

### 3. لوحة التحكم ترجع schema فارغ
- **المسار**: `GET /api/v1/admin/dashboard`
- **المشكلة**: الـ schema في OpenAPI فارغ `{}` — لا توجد حقول محددة
- **التأثير**: الواجهة تتوقع `{regions, cards, published_cards, facilities, customers, owners, products, available_products}`
- **المطلوب**: توثيق الـ response schema في OpenAPI أو تأكيد الأسماء الفعلية للحقول

### 4. لا يوجد باراميتر فلترة حسب الدور للمستخدمين
- **المسار**: `GET /api/v1/admin/users`
- **المشكلة**: لا يمكن فلترة المستخدمين حسب `role` (admin/owner/customer)
- **التأثير**: الواجهة تجلب كل المستخدمين وتفلتر على الجانب العميل لاختيار المالكين
- **المطلوب**: إضافة `?role=owner` باراميتر اختياري

### 5. لا يوجد بحث عام للمنشآت
- **المسار**: `GET /api/v1/facilities`
- **المشكلة**: لا يوجد باراميتر `search` للبحث في اسم المنشأة
- **التأثير**: صفحة المرافق في البوابة العامة تضطر للفلترة client-side
- **المطلوب**: إضافة `?search=...` باراميتر اختياري

## Low

### 6. اقتراح: Refresh Token
- **الحالة الحالية**: JWT صلاحيته 15 دقيقة فقط
- **المشكلة**: تجربة المستخدم سيئة عند انتهاء الجلسة أثناء العمل
- **المطلوب**: نقطة `/api/v1/auth/refresh` تعيد token جديد بـ refresh token طويل الأمد

### 7. استجابة التسجيل
- **المسار**: `POST /api/v1/auth/register`
- **الحالة**: يُرجع `MessageOut {detail, status_code}`
- **ملاحظة**: التوثيق الأصلي يذكر `{message, user_id, assigned_card_id}` — تم التعامل مع الواقع الفعلي (detail فقط)
- **المطلوب**: لو أمكن إضافة `user_id` و `assigned_card_id` لعرض بطاقة العضوية بعد التسجيل