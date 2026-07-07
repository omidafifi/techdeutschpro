const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: 0,
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
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Final price after discount (virtual field)
courseSchema.virtual("finalPrice").get(function () {
  if (this.isFree) return 0;
  return Math.round(this.price * (1 - this.discountPercent / 100));
});

courseSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
