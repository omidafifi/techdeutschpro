const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "نام دانشجو الزامی است"],
      trim: true,
    },
    courseLevel: {
      type: String,
      default: "دانشجوی دوره آلمانی",
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: [true, "متن نظر الزامی است"],
      trim: true,
      maxlength: [1000, "متن نظر نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"],
    },
    avatar: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
