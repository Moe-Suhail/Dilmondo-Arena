# دليل تشغيل ونشر Dilmondo Arena

هذا الدليل يشرح أين توجد لوحة التحكم، كيف تدخل إليها، وكيف تنشر الموقع رسميًا للأصدقاء مع بقاء الإدارة لك فقط.

## 1. روابط الموقع

محليًا على جهازك:

- الموقع العام: `http://localhost:3000`
- لوحة التحكم: `http://localhost:3000/admin`
- إدارة الأعضاء والصور: `http://localhost:3000/admin/members`
- إعدادات الدوري والمزامنة: `http://localhost:3000/admin/settings`
- قاعة المجد: `http://localhost:3000/admin/hall-of-fame`

بعد النشر استبدل `http://localhost:3000` برابط الموقع الرسمي، مثل:

- الموقع العام: `https://your-site.onrender.com`
- لوحة التحكم: `https://your-site.onrender.com/admin`

ملاحظة: رابط لوحة التحكم غير ظاهر في الموقع العام. يجب أن تحفظه أنت أو تضيفه في المفضلة.

## 2. الدخول للوحة التحكم

في التطوير المحلي فقط، إذا لم تضبط كلمة مرور، تكون كلمة المرور:

```bash
dilmondo-admin
```

في النشر الرسمي يجب ضبط كلمة مرور قوية من متغيرات البيئة:

```bash
ADMIN_PASSWORD=ضع-كلمة-مرور-قوية
ADMIN_SESSION_SECRET=سر-طويل-عشوائي-لا-تشاركه
NEXT_PUBLIC_SITE_URL=https://رابط-موقعك
```

مثال جيد لـ `ADMIN_SESSION_SECRET`: نص عشوائي طويل 40 حرفًا أو أكثر.

## 3. ماذا يستطيع الأصدقاء رؤية؟

الأصدقاء يرون فقط الصفحات العامة:

- الرئيسية
- الترتيب
- تقرير الجولة
- المباريات
- هل تعلم؟
- صفحات الأعضاء

الأصدقاء لا يرون رابط الإدارة في التنقل العام. لو عرف أحد رابط `/admin` سيظهر له تسجيل الدخول فقط، ولن يستطيع تعديل شيء بدون كلمة المرور.

## 4. لماذا نوصي بـ Render حاليًا؟

المشروع حاليًا يحفظ:

- بيانات الدوري المحلية في ملف JSON
- صور الأعضاء المرفوعة

لذلك الأفضل استضافة Node.js مع قرص دائم. Render مناسب لأنه يدعم Next.js كـ Node Web Service ويدعم Persistent Disk لحفظ الملفات بعد إعادة التشغيل أو إعادة النشر.

مصادر رسمية:

- Render Next.js deployment: https://render.com/docs/deploy-nextjs-app
- Render Persistent Disks: https://render.com/docs/disks
- Next.js deployment/self-hosting: https://nextjs.im/docs/14/app/building-your-application/deploying/

## 5. خطوات النشر على Render

### الخطوة 1: ارفع المشروع إلى GitHub

الأفضل أن يكون مجلد `dilmondo-arena` هو جذر المستودع.

إذا كنت تستخدم GitHub Desktop:

1. افتح GitHub Desktop.
2. اختر `Add Local Repository`.
3. اختر مجلد:

```bash
C:\Users\Mo Adil\Documents\Dilmondo Arena\dilmondo-arena
```

4. اعمل Publish repository إلى GitHub.

### الخطوة 2: أنشئ Web Service في Render

1. افتح https://render.com
2. اختر `New +`
3. اختر `Web Service`
4. اربط حساب GitHub واختر مستودع `dilmondo-arena`
5. استخدم هذه الإعدادات:

```bash
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm run start
```

### الخطوة 3: أضف متغيرات البيئة

في Render > Environment أضف:

```bash
ADMIN_PASSWORD=كلمة-مرور-خاصة-بك
ADMIN_SESSION_SECRET=سر-طويل-عشوائي
NEXT_PUBLIC_SITE_URL=https://رابط-Render-بعد-النشر
DILMONDO_DATA_DIR=/opt/render/project/src/.dilmondo-data
```

### الخطوة 4: أضف قرص دائم Persistent Disk

في Render أضف Disk للخدمة:

```bash
Mount Path: /opt/render/project/src/.dilmondo-data
```

هذا مهم جدًا حتى لا تضيع صور الأعضاء وتعديلات الإدارة بعد إعادة النشر.

### الخطوة 5: انشر

اضغط Deploy. بعد اكتمال النشر:

1. افتح الموقع العام.
2. افتح `/admin`.
3. ادخل بكلمة المرور التي وضعتها في `ADMIN_PASSWORD`.
4. من `/admin/settings` اضغط تحديث بيانات الدوري.
5. راجع الصفحة الرئيسية والترتيب والمباريات.

## 6. هل يمكن النشر على Vercel؟

نعم، لكن ليس بالوضع الحالي إذا كنت تريد حفظ صور الأعضاء وتعديلات الإدارة على ملفات محلية.

Vercel مناسب جدًا لو نقلنا التخزين إلى:

- Supabase Database + Supabase Storage
- أو Vercel Blob للصور والملفات

مصدر Vercel Blob الرسمي:

https://vercel.com/docs/vercel-blob

إذا أردت Vercel لاحقًا، الخطوة الصحيحة ستكون ربط التخزين أولًا ثم النشر.

## 7. checklist قبل مشاركة الرابط مع الأصدقاء

- تأكد أن `ADMIN_PASSWORD` ليست كلمة سهلة.
- تأكد أن `ADMIN_SESSION_SECRET` مضبوط وقوي.
- تأكد أن رابط `/admin` غير منشور في القروب.
- جرّب تسجيل الخروج والدخول مرة.
- جرّب رفع صورة عضو من `/admin/members`.
- اضغط مزامنة من `/admin/settings`.
- افتح الموقع من الموبايل وتأكد من الصفحة الرئيسية والترتيب والمباريات.

## 8. أوامر التشغيل

تشغيل محلي:

```bash
npm install
npm run dev
```

فحص قبل النشر:

```bash
npm run lint
npm run build
```

تشغيل نسخة الإنتاج محليًا:

```bash
npm run build
npm run start
```
