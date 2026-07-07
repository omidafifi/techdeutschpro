const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
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
        title: { type: String, required: true },
        level: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    payer: {
      fullName: { type: String, required: [true, "Please add full name"] },
      phone: { type: String, required: [true, "Please add phone number"] },
      email: { type: String, required: [true, "Please add email"] },
    },
    note: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["online", "card-to-card"],
      default: "online",
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
