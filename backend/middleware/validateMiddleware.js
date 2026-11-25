const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?\d{10,15}|09\d{9})$/;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

const isValidEmail = (value) => EMAIL_REGEX.test(String(value || "").trim().toLowerCase());

const isValidPhone = (value) =>
  PHONE_REGEX.test(String(value || "").replace(/[\s-]/g, ""));

const normalizePhone = (value) => String(value || "").replace(/[\s-]/g, "").trim();

const parsePagination = (query, defaultLimit = 10, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const validateObjectIdParam = (paramName = "id") => (req, res, next) => {
  if (!isValidObjectId(req.params[paramName])) {
    res.status(400);
    throw new Error(`شناسه ${paramName} نامعتبر است`);
  }
  next();
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  parsePagination,
  validateObjectIdParam,
};
