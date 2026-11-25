const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "لطفاً نام خود را وارد کنید"],
      trim: true,
    },
    // Accepts email or phone in one field
    contact: {
      type: String,
      required: [true, "لطفاً ایمیل یا شماره تلفن را وارد کنید"],
      trim: true,
    },
    subject: {
      type: String,
      default: "پیام عمومی / مشاوره",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "لطفاً متن پیام خود را وارد کنید"],
      maxlength: [2000, "پیام نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactSchema);
