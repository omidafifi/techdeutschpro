const ContactMessage = require("../models/contactModel");
const { parsePagination } = require("../middleware/validateMiddleware");

// @desc   Submit the contact / free consultation form
// @route  POST /api/contact
// @access Public
const createMessage = async (req, res) => {
  const { name, contact, subject, message } = req.body;

  if (!name || !contact || !message) {
    res.status(400);
    throw new Error("لطفاً نام، ایمیل/شماره تلفن و متن پیام را وارد کنید");
  }

  const saved = await ContactMessage.create({
    name: String(name).trim(),
    contact: String(contact).trim(),
    subject: subject ? String(subject).trim() : "پیام عمومی / مشاوره",
    message: String(message).trim(),
  });

  res.status(201).json({
    _id: saved._id,
    message: "پیام شما با موفقیت ارسال شد! به زودی با شما تماس می‌گیریم.",
    data: saved,
  });
};

// @desc   Get all contact messages (?unread=true&page=1&limit=20)
// @route  GET /api/contact
// @access Private/Admin
const getMessages = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const filter = {};
  if (req.query.unread === "true") filter.isRead = false;

  const [messages, total, unreadCount] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(filter),
    ContactMessage.countDocuments({ isRead: false }),
  ]);

  res.json({
    messages,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// @desc   Mark a message as read
// @route  PUT /api/contact/:id/read
// @access Private/Admin
const markAsRead = async (req, res) => {
  const msg = await ContactMessage.findById(req.params.id);

  if (!msg) {
    res.status(404);
    throw new Error("پیام یافت نشد");
  }

  msg.isRead = true;
  await msg.save();
  res.json(msg);
};

// @desc   Save admin reply note on a contact message
// @route  PUT /api/contact/:id/reply
// @access Private/Admin
const replyMessage = async (req, res) => {
  const { adminReply } = req.body;
  if (!adminReply || !String(adminReply).trim()) {
    res.status(400);
    throw new Error("متن پاسخ الزامی است");
  }

  const msg = await ContactMessage.findById(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error("پیام یافت نشد");
  }

  msg.adminReply = String(adminReply).trim();
  msg.repliedAt = new Date();
  msg.isRead = true;
  await msg.save();

  res.json(msg);
};

// @desc   Delete a contact message
// @route  DELETE /api/contact/:id
// @access Private/Admin
const deleteMessage = async (req, res) => {
  const msg = await ContactMessage.findById(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error("پیام یافت نشد");
  }

  await msg.deleteOne();
  res.json({ id: req.params.id, message: "پیام حذف شد" });
};

module.exports = {
  createMessage,
  getMessages,
  markAsRead,
  replyMessage,
  deleteMessage,
};
