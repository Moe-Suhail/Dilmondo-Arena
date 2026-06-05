# دليل نشر Dilmondo Arena مجانًا على Vercel + Supabase

هذا هو المسار الرسمي المجاني للمشروع:

- الاستضافة: Vercel Hobby Free
- قاعدة البيانات: Supabase Free
- تخزين صور الأعضاء: Supabase Storage Free
- لا يوجد اعتماد إنتاجي على ملفات JSON محلية أو صور محفوظة على السيرفر

## 1. روابط الموقع

محليًا:

- الموقع العام: `http://localhost:3000`
- لوحة التحكم: `http://localhost:3000/admin`
- إدارة الأعضاء: `http://localhost:3000/admin/members`
- إعدادات الدوري والمزامنة: `http://localhost:3000/admin/settings`
- قاعة المجد: `http://localhost:3000/admin/hall-of-fame`

بعد النشر:

- الموقع العام: `https://dilmondo-arena.vercel.app`
- لوحة التحكم: `https://dilmondo-arena.vercel.app/admin`

رابط لوحة التحكم غير ظاهر في الموقع العام. احفظه عندك فقط.

## 2. إعداد Supabase

1. افتح https://supabase.com
2. أنشئ مشروعًا جديدًا.
3. افتح `SQL Editor`.
4. انسخ محتوى الملف التالي وشغله:

```text
supabase/schema.sql
```

هذا ينشئ الجداول:

- `league_settings`
- `members`
- `standings_snapshots`
- `manager_gameweek_snapshots`
- `banter_templates`
- `hall_of_fame`
- `homepage_announcements`

وينشئ Storage bucket باسم:

```text
member-avatars
```

الصور عامة للقراءة، لكن الرفع والتحديث والحذف يتم فقط من server routes الخاصة بلوحة التحكم.

## 3. مفاتيح Supabase المطلوبة

من Supabase Dashboard:

`Project Settings > API`

انسخ:

- Project URL
- anon public key
- service_role key

مهم: `service_role key` لا تضعه أبدًا في كود frontend ولا ترسله لأحد.

## 4. متغيرات Vercel

في Vercel:

`Project > Settings > Environment Variables`

أضف:

```bash
NEXT_PUBLIC_SUPABASE_URL=ضع Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=ضع anon public key
SUPABASE_SERVICE_ROLE_KEY=ضع service_role key
ADMIN_PASSWORD=كلمة مرور قوية لك فقط
ADMIN_SESSION_SECRET=نص طويل عشوائي جدًا
FPL_LEAGUE_ID=403186
NEXT_PUBLIC_SITE_URL=https://dilmondo-arena.vercel.app
```

`ADMIN_SESSION_SECRET` يجب أن يكون طويلًا، مثل 40 حرفًا أو أكثر.

## 5. رفع المشروع إلى GitHub

داخل مجلد المشروع:

```bash
git status
git add .
git commit -m "Switch production storage to Supabase"
git push
```

إذا لم يكن الريبو مربوطًا بعد:

```bash
git remote add origin https://github.com/Moe-Suhail/Dilmondo-Arena.git
git branch -M main
git push -u origin main
```

## 6. النشر على Vercel

1. افتح https://vercel.com
2. اختر `Add New Project`.
3. اختر مستودع GitHub:

```text
Moe-Suhail/Dilmondo-Arena
```

4. Vercel سيتعرف على Next.js تلقائيًا.
5. أضف متغيرات البيئة من القسم السابق.
6. اضغط Deploy.

مراجع رسمية:

- Vercel Next.js: https://vercel.com/docs/concepts/next.js/overview
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase public storage URLs: https://supabase.com/docs/guides/storage/serving/downloads/

## 7. أول تشغيل بعد النشر

بعد نجاح Deploy:

1. افتح الموقع العام.
2. افتح `/admin`.
3. ادخل بكلمة `ADMIN_PASSWORD`.
4. افتح `/admin/settings`.
5. اضغط تحديث بيانات الدوري.
6. افتح الرئيسية والترتيب والمباريات للتأكد من ظهور بيانات FPL.
7. افتح `/admin/members` وجرب رفع صورة عضو. يجب أن تبقى الصورة بعد إعادة نشر Vercel لأنها محفوظة في Supabase Storage.

## 8. ماذا يحدث في التطوير المحلي؟

إذا لم تضبط Supabase محليًا، يستخدم التطبيق:

- `data/dilmondo-store.json`
- مجلد رفع محلي للتطوير فقط

هذا مقبول محليًا، لكنه غير مستخدم في الإنتاج. في الإنتاج يجب وجود Supabase env vars، وإلا سيرفض التطبيق الاعتماد على local filesystem.

## 9. فحص قبل النشر

```bash
npm run lint
npm run build
```

## 10. حماية لوحة التحكم

- رابط `/admin` غير ظاهر في التنقل العام.
- كل API routes الخاصة بالإدارة تتطلب جلسة موقعة.
- الجلسة تعتمد على secure signed cookies.
- قاعدة البيانات لا تملك anon policies للجداول.
- الرفع إلى Storage يتم عبر server route فقط باستخدام service role key.
