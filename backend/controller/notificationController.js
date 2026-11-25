const Notification = require("../models/notificationModel");

// @desc   Get notifications for current visitor or logged-in user
// @route  GET /api/notifications
// @access Public (returns broadcast notifications + user-specific notifications if logged in)
const getNotifications = async (req, res) => {
  const filter = req.user
    ? {
        $or: [
          { user: req.user._id, isRead: false },
          { user: null, readBy: { $ne: req.user._id } },
        ],
      }
    : { user: null };

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    unreadCount: notifications.length,
    notifications,
  });
};

// @desc   Mark a notification as read
// @route  PUT /api/notifications/:id/read
// @access Private
const markRead = async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) {
    res.status(404);
    throw new Error("اعلان یافت نشد");
  }

  if (notif.user) {
    if (String(notif.user) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("دسترسی غیرمجاز");
    }
    notif.isRead = true;
  } else {
    if (!notif.readBy.some((id) => String(id) === String(req.user._id))) {
      notif.readBy.push(req.user._id);
    }
  }

  await notif.save();
  res.json({ message: "اعلان به عنوان خوانده‌شده علامت‌گذاری شد" });
};

// @desc   Clear / mark all notifications as read for current user
// @route  PUT /api/notifications/clear
// @access Private
const clearAll = async (req, res) => {
  await Promise.all([
    Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    ),
    Notification.updateMany(
      { user: null, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    ),
  ]);

  res.json({ message: "همه اعلان‌ها پاک شدند" });
};

// @desc   Create a broadcast or targeted notification
// @route  POST /api/notifications
// @access Private/Admin
const createNotification = async (req, res) => {
  const { user, title, message, type, icon, link } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("عنوان و متن اعلان الزامی هستند");
  }

  const notif = await Notification.create({
    user: user || null,
    title,
    message,
    type: type || "system",
    icon: icon || "fas fa-bell",
    link: link || "",
  });

  res.status(201).json(notif);
};

module.exports = { getNotifications, markRead, clearAll, createNotification };
