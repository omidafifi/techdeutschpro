const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Course = require("../models/courseModel");

// @desc   Create a new order (checkout)
// @route  POST /api/orders
// @access Public (guest checkout allowed; if a token is sent, the order is linked to the user)
// body: { items: [{ id?, title, level?, price }], payer: { fullName, phone, email }, note?, paymentMethod? }
const createOrder = asyncHandler(async (req, res) => {
  const { items, payer, note, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  if (!payer || !payer.fullName || !payer.phone || !payer.email) {
    res.status(400);
    throw new Error("Please provide payer fullName, phone and email");
  }

  // Rebuild each item on the server. If the item id matches a course in the DB,
  // ALWAYS use the database price — never trust prices sent by the client.
  const orderItems = [];
  for (const item of items) {
    let course = null;

    if (item.id && String(item.id).match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(item.id);
    }

    if (course) {
      orderItems.push({
        course: course._id,
        title: course.title,
        level: course.level,
        price: course.finalPrice,
      });
    } else {
      // Fallback for legacy cart items that only exist in the frontend HTML.
      // Once courses are seeded in the DB, update the frontend data-id attributes.
      const price = Number(item.price);
      if (!item.title || Number.isNaN(price) || price < 0) {
        res.status(400);
        throw new Error("Invalid cart item");
      }
      orderItems.push({
        course: null,
        title: item.title,
        level: item.level || "",
        price,
      });
    }
  }

  const totalPrice = orderItems.reduce((sum, i) => sum + i.price, 0);

  const order = await Order.create({
    user: req.user ? req.user._id : null,
    items: orderItems,
    payer: {
      fullName: payer.fullName,
      phone: payer.phone,
      email: payer.email,
    },
    note: note || "",
    paymentMethod: paymentMethod === "card-to-card" ? "card-to-card" : "online",
    totalPrice,
  });

  res.status(201).json(order);
});

// @desc   Get logged-in user's orders
// @route  GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc   Get all orders
// @route  GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc   Update order status (e.g. mark as paid after card-to-card verification)
// @route  PUT /api/orders/:id/status
// @access Private/Admin
// body: { status: "pending" | "paid" | "canceled" }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["pending", "paid", "canceled"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.paidAt = status === "paid" ? new Date() : order.paidAt;
  const updated = await order.save();

  res.json(updated);
});

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus };
