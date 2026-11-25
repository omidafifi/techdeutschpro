const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "متن سوال الزامی است"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "متن پاسخ الزامی است"],
      trim: true,
    },
    page: {
      type: String,
      enum: ["home", "contact", "all"],
      default: "all",
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
