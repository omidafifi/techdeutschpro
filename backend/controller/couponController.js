const Coupon = require("../models/couponModel");
const { applyCouponIfPresent } = require("./orderController");

// @desc   Validate a coupon code and preview discount
// @route  POST /api/coupons/validate
// @access Public
const validateCoupon = async (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("لطفاً کد تخفیف را وارد کنید");
  }

  const amount = Math.max(0, Number(subtotal) || 0);
  try {
    const { coupon, discountAmount } = await applyCouponIfPresent(code, amount);
    res.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalTotal: Math.max(0, amount - discountAmount),
    });
  } catch (err) {
    res.status(err.statusCode || 400);
    throw err;
  }
};

// @desc   Get all coupons
// @route  GET /api/coupons
// @access Private/Admin
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
};

// @desc   Create coupon
// @route  POST /api/coupons
// @access Private/Admin
const createCoupon = async (req, res) => {
  const {
    code,
    description,
    discountPercent,
    maxDiscount,
    minOrderAmount,
    usageLimit,
    expiresAt,
    isActive,
  } = req.body;

  if (!code || discountPercent === undefined) {
    res.status(400);
    throw new Error("کد تخفیف و درصد تخفیف الزامی هستند");
  }

  const coupon = await Coupon.create({
    code: String(code).toUpperCase().trim(),
    description,
    discountPercent,
    maxDiscount,
    minOrderAmount,
    usageLimit,
    expiresAt,
    isActive,
  });

  res.status(201).json(coupon);
};

// @desc   Update coupon
// @route  PUT /api/coupons/:id
// @access Private/Admin
const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("کد تخفیف یافت نشد");
  }

  const allowed = [
    "code",
    "description",
    "discountPercent",
    "maxDiscount",
    "minOrderAmount",
    "usageLimit",
    "expiresAt",
    "isActive",
  ];
  for (const field of allowed) {
    if (req.body[field] !== undefined) coupon[field] = req.body[field];
  }

  const updated = await coupon.save();
  res.json(updated);
};

// @desc   Delete coupon
// @route  DELETE /api/coupons/:id
// @access Private/Admin
const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("کد تخفیف یافت نشد");
  }

  await coupon.deleteOne();
  res.json({ id: req.params.id, message: "کد تخفیف حذف شد" });
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
