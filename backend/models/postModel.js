const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    authorName: {
      type: String,
      required: [true, "نام نویسنده دیدگاه الزامی است"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "متن دیدگاه الزامی است"],
      trim: true,
      maxlength: [1000, "دیدگاه نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان مطلب الزامی است"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "اسلاگ مطلب الزامی است"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["education", "articles", "culture", "news"],
      required: [true, "دسته‌بندی مطلب الزامی است"],
    },
    tag: {
      type: String,
      default: "آموزش",
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "خلاصه مطلب الزامی است"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "متن کامل مطلب الزامی است"],
    },
    image: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      default: "امید عفیفی",
    },
    persianDate: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
