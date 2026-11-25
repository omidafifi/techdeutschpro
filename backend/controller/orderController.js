const crypto = require("crypto");
const Order = require("../models/orderModel");
const Course = require("../models/courseModel");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  parsePagination,
} = require("../middleware/validateMiddleware");

const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TDP-${year}-${suffix}`;
};

// Enroll a user in all DB-backed courses in an order
const enrollUserInOrderCourses = async (order) => {
  if (!order.user) return;
  const courseIds = order.items
    .map((item) => item.course)
    .filter(Boolean);

  if (courseIds.length === 0) return;

  await User.findByIdAndUpdate(order.user, {
    $addToSet: { enrolledCourses: { $each: courseIds } },
  });

  await Course.updateMany(
    { _id: { $in: courseIds } },
    { $inc: { studentsCount: 1 } }
  );
};

// Calculate coupon discount safely
const applyCouponIfPresent = async (couponCode, subtotal) => {
  if (!couponCode) return { coupon: null, discountAmount: 0 };

  const code = String(couponCode).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code, isActive: true });

  if (!coupon) {
    const err = new Error("کد تخفیف نامعتبر یا غیرفعال است");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    const err = new Error("مهلت استفاده از این کد تخفیف به پایان رسیده است");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error("ظرفیت استفاده از این کد تخفیف تکمیل شده است");
    err.statusCode = 400;
    throw err;
  }

  if (subtotal < coupon.minOrderAmount) {
    const err = new Error(
      `حداقل مبلغ سفارش برای این کد تخفیف ${coupon.minOrderAmount.toLocaleString()} تومان است`
    );
    err.statusCode = 400;
    throw err;
  }

  let discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
  if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }

  return { coupon, discountAmount };
};

// @desc   Create a new order (checkout)
// @route  POST /api/orders
// @access Public (guest checkout allowed; logged-in user attached via optionalProtect)
const createOrder = async (req, res) => {
  const { items, payer, note, paymentMethod, couponCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("سبد خرید خالی است");
  }

  if (!payer || !payer.fullName || !payer.phone || !payer.email) {
    res.status(400);
    throw new Error("لطفاً نام و نام خانوادگی، شماره موبایل و ایمیل را وارد کنید");
  }

  if (!isValidEmail(payer.email)) {
    res.status(400);
    throw new Error("فرمت ایمیل پرداخت‌کننده نامعتبر است");
  }

  const normalizedPhone = normalizePhone(payer.phone);
  if (!isValidPhone(normalizedPhone)) {
    res.status(400);
    throw new Error("فرمت شماره موبایل پرداخت‌کننده نامعتبر است");
  }

  // Rebuild each item on the server. Match by ObjectId OR slug (e.g. "course-a1").
  const orderItems = [];
  for (const item of items) {
    let course = null;
    const rawId = item.id || item.courseId || item.slug;

    if (rawId && isValidObjectId(rawId)) {
      course = await Course.findById(rawId);
    } else if (rawId) {
      course = await Course.findOne({ slug: String(rawId).toLowerCase().trim() });
    }

    if (course) {
      orderItems.push({
        course: course._id,
        slug: course.slug,
        title: course.title,
        level: course.level,
        price: course.finalPrice,
      });
    } else {
      // Fallback only for unseeded/custom cart items
      const price = Number(item.price);
      if (!item.title || Number.isNaN(price) || price < 0) {
        res.status(400);
        throw new Error("آیتم نامعتبر در سبد خرید");
      }
      orderItems.push({
        course: null,
        slug: rawId ? String(rawId) : "",
        title: String(item.title).trim(),
        level: item.level ? String(item.level).trim() : "",
        price,
      });
    }
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price, 0);

  let coupon = null;
  let discountAmount = 0;
  if (couponCode) {
    try {
      const result = await applyCouponIfPresent(couponCode, subtotal);
      coupon = result.coupon;
      discountAmount = result.discountAmount;
    } catch (err) {
      res.status(err.statusCode || 400);
      throw err;
    }
  }

  const totalPrice = Math.max(0, subtotal - discountAmount);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user ? req.user._id : null,
    items: orderItems,
    payer: {
      fullName: String(payer.fullName).trim(),
      phone: normalizedPhone,
      email: String(payer.email).trim().toLowerCase(),
    },
    note: note ? String(note).trim() : "",
    paymentMethod: paymentMethod === "card-to-card" ? "card-to-card" : "online",
    subtotal,
    couponCode: coupon ? coupon.code : null,
    discountAmount,
    totalPrice,
  });

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Create notification for logged-in user
  if (req.user) {
    await Notification.create({
      user: req.user._id,
      title: "ثبت سفارش جدید",
      message: `سفارش ${order.orderNumber} به مبلغ ${order.totalPrice.toLocaleString()} تومان ثبت شد.`,
      type: "order",
      icon: "fas fa-receipt",
      link: "checkout.html",
    });
  }

  res.status(201).json(order);
};

// @desc   Confirm/pay an order (online sandbox confirmation or card-to-card receipt submission)
// @route  POST /api/orders/:id/pay
// @access Public (order owner or guest with matching orderId)
const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  if (order.status === "paid") {
    return res.json({ message: "این سفارش قبلاً پرداخت شده است", order });
  }

  if (order.status === "canceled") {
    res.status(400);
    throw new Error("سفارش لغو شده قابل پرداخت نیست");
  }

  if (order.paymentMethod === "card-to-card") {
    const { cardReceiptNumber } = req.body;
    if (!cardReceiptNumber) {
      res.status(400);
      throw new Error("لطفاً شماره پیگیری/رسید کارت به کارت را وارد کنید");
    }
    order.cardReceiptNumber = String(cardReceiptNumber).trim();
    await order.save();
    return res.json({
      message: "رسید کارت به کارت ثبت شد و پس از تایید مدیریت، دوره‌ها فعال می‌شوند.",
      order,
    });
  }

  // Simulated online gateway verification
  order.status = "paid";
  order.paidAt = new Date();
  order.paymentRef =
    req.body.paymentRef || `PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  await order.save();

  await enrollUserInOrderCourses(order);

  if (order.user) {
    await Notification.create({
      user: order.user,
      title: "پرداخت موفق",
      message: `پرداخت سفارش ${order.orderNumber} با موفقیت انجام شد و دسترسی به دوره‌ها فعال گردید.`,
      type: "order",
      icon: "fas fa-check-circle",
    });
  }

  res.json({
    message: "پرداخت با موفقیت انجام شد",
    order,
  });
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/my
// @access Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.course", "title slug level image")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc   Get single order (owner or admin)
// @route  GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.course", "title slug level image");

  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  const isOwner = order.user && String(order.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("اجازه مشاهده این سفارش را ندارید");
  }

  res.json(order);
};

// @desc   Get all orders (admin, with optional ?status=paid&page=1&limit=20)
// @route  GET /api/orders
// @access Private/Admin
const getOrders = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const filter = {};
  if (req.query.status && ["pending", "paid", "canceled", "refunded"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// @desc   Update order status (admin)
// @route  PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!["pending", "paid", "canceled", "refunded"].includes(status)) {
    res.status(400);
    throw new Error("وضعیت سفارش نامعتبر است");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("سفارش یافت نشد");
  }

  const previousStatus = order.status;
  order.status = status;
  if (status === "paid" && !order.paidAt) {
    order.paidAt = new Date();
  }

  const updated = await order.save();

  if (previousStatus !== "paid" && status === "paid") {
    await enrollUserInOrderCourses(order);
    if (order.user) {
      await Notification.create({
        user: order.user,
        title: "تایید سفارش",
        message: `سفارش ${order.orderNumber} تایید شد و دوره‌های شما فعال شدند.`,
        type: "order",
        icon: "fas fa-check-circle",
      });
    }
  }

  res.json(updated);
};

module.exports = {
  createOrder,
  payOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  applyCouponIfPresent,
};
