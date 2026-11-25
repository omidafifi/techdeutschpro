const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // Optional: guest checkout is allowed, so user can be null
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    items: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          default: null,
        },
        slug: { type: String, default: "" },
        title: { type: String, required: true },
        level: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    payer: {
      fullName: { type: String, required: [true, "نام و نام خانوادگی الزامی است"], trim: true },
      phone: { type: String, required: [true, "شماره موبایل الزامی است"], trim: true },
      email: { type: String, required: [true, "ایمیل الزامی است"], trim: true, lowercase: true },
    },
    note: {
      type: String,
      default: "",
      maxlength: [1000, "توضیحات سفارش نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد"],
    },
    paymentMethod: {
      type: String,
      enum: ["online", "card-to-card"],
      default: "online",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled", "refunded"],
      default: "pending",
    },
    paymentRef: {
      type: String,
      default: null,
    },
    cardReceiptNumber: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
