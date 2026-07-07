const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
    },
    // The form accepts "email or phone" in one field
    contact: {
      type: String,
      required: [true, "Please add an email or phone number"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
      maxlength: [2000, "Message is too long"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactSchema);
