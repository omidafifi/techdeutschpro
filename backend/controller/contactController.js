const asyncHandler = require("express-async-handler");
const ContactMessage = require("../models/contactModel");

// @desc   Submit the contact form
// @route  POST /api/contact
// @access Public
// body: { name, contact (email or phone), message }
const createMessage = asyncHandler(async (req, res) => {
  const { name, contact, message } = req.body;

  if (!name || !contact || !message) {
    res.status(400);
    throw new Error("Please provide name, contact and message");
  }

  const saved = await ContactMessage.create({ name, contact, message });

  res.status(201).json({
    _id: saved._id,
    message: "Message received",
  });
});

// @desc   Get all contact messages
// @route  GET /api/contact
// @access Private/Admin
const getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
  res.json(messages);
});

// @desc   Mark a message as read
// @route  PUT /api/contact/:id/read
// @access Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findById(req.params.id);

  if (!msg) {
    res.status(404);
    throw new Error("Message not found");
  }

  msg.isRead = true;
  await msg.save();
  res.json(msg);
});

module.exports = { createMessage, getMessages, markAsRead };
