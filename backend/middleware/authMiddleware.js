const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const env = require("../config/env");

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// Protect routes: requires a valid "Authorization: Bearer <token>" header
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401);
    throw new Error("دسترسی غیرمجاز: توکن احراز هویت ارسال نشده است");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("کاربر یافت نشد");
    }

    if (user.isActive === false) {
      res.status(403);
      throw new Error("حساب کاربری غیرفعال شده است");
    }

    req.user = user;
    next();
  } catch (error) {
    if (res.statusCode === 200) res.status(401);
    throw new Error(
      error.name === "TokenExpiredError"
        ? "نشست کاربری منقضی شده است، لطفاً مجدداً وارد شوید"
        : error.message || "توکن نامعتبر است"
    );
  }
};

// Optional auth: attaches req.user when a valid Bearer token is present, otherwise continues as guest
const optionalProtect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user && user.isActive !== false ? user : null;
  } catch {
    req.user = null;
  }

  next();
};

// Admin-only routes (must run after protect)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("دسترسی فقط برای مدیران مجاز است");
};

module.exports = { protect, optionalProtect, admin };
