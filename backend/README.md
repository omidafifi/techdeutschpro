# Tech Deutsch Pro — Backend (Express + MongoDB)

بک‌اند کامل سایت Tech Deutsch Pro با همان ساختار MVC که در پروژه داشتی (controller / routes / middleware) به‌علاوه models و config.

## راه‌اندازی

```bash
# 1. نصب پکیج‌ها (در ریشه پروژه)
npm install

# 2. ساخت فایل .env
cp backend/.env.example backend/.env   # مقادیر را ویرایش کن
# اگر از ریشه پروژه اجرا می‌کنی، فایل .env باید کنار محل اجرای node باشد
# (dotenv از دایرکتوری جاری می‌خواند) — ساده‌ترین حالت: .env را در ریشه ریپو بگذار

# 3. اجرای MongoDB (لوکال یا MongoDB Atlas)

# 4. سید کردن دوره‌ها در دیتابیس
npm run seed

# 5. اجرای سرور (حالت توسعه با nodemon)
npm run server
```

سرور روی `http://localhost:3000` بالا می‌آید و **فرانت‌اند هم به صورت static از همان‌جا سرو می‌شود** — یعنی `http://localhost:3000/index.html` سایتت را نشان می‌دهد و مشکلی با CORS نخواهی داشت.

## متغیرهای محیطی (.env)

| متغیر | توضیح |
|---|---|
| `PORT` | پورت سرور (پیش‌فرض 3000) |
| `MONGO_URI` | آدرس اتصال MongoDB |
| `JWT_SECRET` | یک رشته تصادفی طولانی برای امضای توکن‌ها |
| `JWT_EXPIRES_IN` | مدت اعتبار توکن (مثلاً `30d`) |
| `NODE_ENV` | `development` یا `production` |

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `{ name, identifier, password }` — identifier می‌تواند ایمیل یا شماره موبایل باشد |
| POST | `/login` | Public | `{ identifier, password }` |
| GET | `/me` | Private (Bearer token) | — |

### Courses — `/api/courses`
| Method | Route | Access | توضیح |
|---|---|---|---|
| GET | `/` | Public | فیلترها: `?level=B1` و `?free=true` |
| GET | `/:idOrSlug` | Public | با id یا slug (مثل `german-b1`) |
| POST | `/` | Admin | ساخت دوره |
| PUT | `/:id` | Admin | ویرایش دوره |
| DELETE | `/:id` | Admin | حذف دوره |

### Orders — `/api/orders`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/` | Public (خرید مهمان مجاز) | `{ items, payer: { fullName, phone, email }, note?, paymentMethod? }` |
| GET | `/my` | Private | سفارش‌های کاربر لاگین‌شده |
| GET | `/` | Admin | همه سفارش‌ها |
| PUT | `/:id/status` | Admin | `{ status: "paid" \| "canceled" \| "pending" }` |

> 🔒 نکته امنیتی: قیمت آیتم‌ها اگر id دوره در دیتابیس باشد **همیشه از دیتابیس** خوانده می‌شود، نه از کلاینت.

### Contact — `/api/contact`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/` | Public | `{ name, contact, message }` |
| GET | `/` | Admin | همه پیام‌ها |
| PUT | `/:id/read` | Admin | علامت‌گذاری خوانده‌شده |

### Goals — `/api/goals`
همان ماژول تمرینی دوره Node.js، دست‌نخورده باقی مانده است.

## ساخت اولین ادمین

یک کاربر عادی با `/api/auth/register` بساز، بعد در MongoDB مقدار `role` آن را به `admin` تغییر بده:

```js
// در mongosh:
use techdeutschpro
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## اتصال فرانت‌اند

فایل `frontend/api.js` را به صفحات اضافه کن (قبل از `script.js`):

```html
<script src="api.js"></script>
```

داخل آن توابع آماده برای فرم تماس، checkout و ورود/ثبت‌نام هست + توضیح اینکه کدام handler قدیمی (alert نمایشی) را با کدام تابع جایگزین کنی.
