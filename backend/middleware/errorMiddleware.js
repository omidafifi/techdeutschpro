const env = require("../config/env");

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`مسیر مورد نظر یافت نشد: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handler (handles Mongoose, JWT, SyntaxError, and app errors)
const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "خطای داخلی سرور";
  let errors = null;

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `شناسه نامعتبر است: ${err.value}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    message = `مقدار تکراری برای فیلد: ${fields.join(", ")}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = errors.map((e) => e.message).join(" | ");
  }

  // Invalid JSON payload
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "فرمت JSON ارسال‌شده نامعتبر است";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "توکن نامعتبر است";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "توکن منقضی شده است";
  }

  const payload = {
    success: false,
    message,
  };

  if (errors) payload.errors = errors;
  if (env.nodeEnv !== "production" && env.nodeEnv !== "test") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  notFound,
  errorHandler,
};
