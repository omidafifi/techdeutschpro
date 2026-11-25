# Tech Deutsch Pro — Complete Express + MongoDB Backend

بک‌اند کامل (۰ تا ۱۰۰) سایت **Tech Deutsch Pro** با **Express 5** و **MongoDB / Mongoose 9** همراه با احراز هویت JWT، امنیت (Helmet + Rate Limiting)، کد تخفیف، ثبت سفارش و پرداخت، وبلاگ و دیدگاه، منابع آموزشی، خبرنامه، جستجوی سراسری، اعلان‌ها، چت‌بات هوشمند، داشبورد ادمین و اتصال کامل به فرانت‌اند.

## راه‌اندازی سریع

```bash
cd backend

# 1. نصب پکیج‌ها
npm install

# 2. تنظیم فایل محیطی
cp .env.example .env

# 3. اطمینان از اجرای MongoDB (مثلاً به صورت لوکال)
# mongod --dbpath ~/data/db

# 4. پر کردن دیتابیس با داده‌های اولیه سایت + اکانت ادمین
npm run seed

# 5. اجرای سرور (توسعه)
npm run dev
# یا اجرای معمولی
npm start

# 6. اجرای تست‌های خودکار End-to-End
npm test
```

پس از اجرا:
- سایت کامل روی `http://localhost:3000/index.html` در دسترس است.
- مستندات API روی `http://localhost:3000/api/docs` و وضعیت سلامت سرور روی `http://localhost:3000/api/health`.
- اکانت ادمین پیش‌فرض (پس از `npm run seed`): `admin@techdeutschpro.com` / `Admin1234!`
- کدهای تخفیف پیش‌فرض: `SUMMER20` (۲۰٪ تخفیف) و `WELCOME10` (۱۰٪ تخفیف)

## ساختار پوشه‌ها

```text
backend/
├── app.js                 # پیکربندی Express، میدل‌ورها، روت‌ها و سرو فرانت‌اند
├── server.js              # نقطه ورود سرور و Graceful Shutdown
├── seeder.js              # سیدر کامل دیتابیس
├── config/
│   ├── env.js             # مدیریت متغیرهای محیطی (.env)
│   └── db.js              # اتصال به MongoDB
├── middleware/
│   ├── authMiddleware.js      # protect, optionalProtect, admin
│   ├── errorMiddleware.js     # 404 و مدیریت یکپارچه خطاها
│   ├── rateLimitMiddleware.js # محدودیت درخواست (Rate Limit)
│   └── validateMiddleware.js  # اعتبارسنجی ایمیل، موبایل، ObjectId و صفحه‌بندی
├── models/                # ۱۲ مدل Mongoose (User, Course, Order, Coupon, Post, Resource, ...)
├── controller/            # کنترلرهای ماژولار هر بخش
├── routes/                # روت‌های RESTful Express
└── tests/
    └── api.test.js        # تست‌های یکپارچه کامل همه ماژول‌ها
```

## خلاصه API Endpoints

### Health & Docs
- `GET /api/health` — وضعیت سرور و دیتابیس
- `GET /api/docs` — لیست کامل همه Endpointها

### احراز هویت و کاربران (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — ثبت‌نام با نام، ایمیل یا موبایل (`identifier`) و رمز عبور
- `POST /api/auth/login` — ورود و دریافت JWT
- `GET /api/auth/me` *(Private)* — اطلاعات کاربر + دوره‌های ثبت‌نام‌شده
- `PUT /api/auth/me` *(Private)* — ویرایش پروفایل
- `PUT /api/auth/change-password` *(Private)* — تغییر رمز عبور
- `POST /api/auth/forgot-password` — درخواست بازیابی رمز عبور
- `POST /api/auth/reset-password/:token` — ثبت رمز عبور جدید با توکن
- `GET /api/auth/my-courses` *(Private)* — لیست دوره‌های خریداری‌شده کاربر
- `GET/PUT/DELETE /api/users` *(Admin)* — مدیریت کاربران

### دوره‌ها (`/api/courses`)
- `GET /api/courses` — لیست دوره‌ها (`?level=B1&free=true&discounted=true&q=...&sort=price_asc`)
- `GET /api/courses/:idOrSlug` — جزئیات یک دوره با ID یا Slug (مثل `course-a1`)
- `POST /api/courses`, `PUT /api/courses/:id`, `DELETE /api/courses/:id` *(Admin)*

### سفارش‌ها، پرداخت و کد تخفیف (`/api/orders`, `/api/coupons`)
- `POST /api/coupons/validate` — بررسی کد تخفیف و محاسبه مبلغ نهایی
- `POST /api/orders` *(Public / OptionalAuth)* — ثبت سفارش با محاسبه امن قیمت در سرور
- `POST /api/orders/:id/pay` — پرداخت آنلاین یا ثبت رسید کارت‌به‌کارت + ثبت‌نام خودکار کاربر در دوره‌ها
- `GET /api/orders/my` *(Private)* — سفارش‌های کاربر
- `GET /api/orders/:id` *(Private)* — جزئیات یک سفارش
- `GET /api/orders`, `PUT /api/orders/:id/status` *(Admin)* — مدیریت و تایید سفارش‌ها

### وبلاگ، مقالات و منابع دیجیتال (`/api/posts`, `/api/resources`)
- `GET /api/posts` — لیست مطالب با فیلتر `?category=education|articles|culture|news&tag=&q=&page=&limit=`
- `GET /api/posts/:idOrSlug` — مشاهده مطلب (همراه با افزایش شمارنده بازدید)
- `POST /api/posts/:id/comments` — ثبت دیدگاه روی مطلب
- `GET /api/resources` — لیست منابع آموزشی دیجیتال
- `POST /api/resources/:id/download` — ثبت دانلود و دریافت لینک منبع

### نظرات دانشجویان، تماس، خبرنامه، اعلان‌ها، جستجو و چت‌بات
- `GET /api/testimonials` / `POST /api/testimonials` / `PUT /api/testimonials/:id/approve` *(Admin)*
- `POST /api/contact` / `GET /api/contact` *(Admin)* / `PUT /api/contact/:id/read` / `PUT /api/contact/:id/reply`
- `POST /api/newsletter/subscribe` / `POST /api/newsletter/unsubscribe` / `GET /api/newsletter` *(Admin)*
- `GET /api/notifications` / `PUT /api/notifications/:id/read` / `PUT /api/notifications/clear`
- `GET /api/search?q=...` — جستجوی یکپارچه در دوره‌ها، مقالات و منابع
- `POST /api/chat` & `GET /api/chat/:sessionId` — چت‌بات پشتیبانی هوشمند متصل به دیتابیس
- `GET /api/site/stats` & `GET /api/site/faqs` — آمار سایت و سوالات متداول
- `GET /api/admin/dashboard` *(Admin)* — گزارش تحلیلی کل سایت و درآمد
