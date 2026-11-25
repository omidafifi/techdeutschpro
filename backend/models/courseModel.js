const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان دوره الزامی است"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "اسلاگ دوره الزامی است"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1"],
      required: [true, "سطح دوره الزامی است"],
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    colorTheme: {
      type: String,
      enum: ["blue", "green", "orange", "purple", "red", "yellow"],
      default: "blue",
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    syllabus: [
      {
        title: { type: String, required: true },
        lessonsCount: { type: Number, default: 1 },
        durationMinutes: { type: Number, default: 90 },
      },
    ],
    duration: {
      type: String,
      default: "۳ ماه",
    },
    sessionsCount: {
      type: Number,
      default: 48,
      min: 1,
    },
    instructor: {
      type: String,
      default: "امید عفیفی",
    },
    price: {
      type: Number,
      required: [true, "قیمت دوره الزامی است"],
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    studentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.virtual("finalPrice").get(function () {
  if (this.isFree) return 0;
  return Math.round(this.price * (1 - (this.discountPercent || 0) / 100));
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
