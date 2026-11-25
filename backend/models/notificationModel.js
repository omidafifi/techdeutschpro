const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // null means global/broadcast notification visible to all visitors
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: [true, "عنوان اعلان الزامی است"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "متن اعلان الزامی است"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["promo", "order", "course", "system"],
      default: "system",
    },
    icon: {
      type: String,
      default: "fas fa-bell",
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
