const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان منبع الزامی است"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "اسلاگ منبع الزامی است"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "توضیحات منبع الزامی است"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["book", "website", "audio", "pdf", "app"],
      default: "book",
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "ALL"],
      default: "ALL",
    },
    url: {
      type: String,
      required: [true, "لینک منبع الزامی است"],
      trim: true,
    },
    icon: {
      type: String,
      default: "fas fa-book",
    },
    color: {
      type: String,
      default: "blue",
    },
    downloadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
