const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const createLimiter = (options) => {
  if (env.nodeEnv === "test") {
    return (req, res, next) => next();
  }
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// General API rate limit
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.",
  },
});

// Stricter limiter for authentication endpoints
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "تعداد تلاش‌های ورود/ثبت‌نام بیش از حد مجاز است. ۱۵ دقیقه دیگر تلاش کنید.",
  },
});

// Limiter for public form submissions (contact, newsletter, testimonials, chat)
const formLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: "درخواست‌های زیادی ارسال کرده‌اید. لطفاً کمی صبر کنید.",
  },
});

module.exports = { apiLimiter, authLimiter, formLimiter };
