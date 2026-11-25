const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
  markAsRead,
  replyMessage,
  deleteMessage,
} = require("../controller/contactController");
const { protect, admin } = require("../middleware/authMiddleware");
const { formLimiter } = require("../middleware/rateLimitMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router
  .route("/")
  .post(formLimiter, createMessage)
  .get(protect, admin, getMessages);

router.put("/:id/read", protect, admin, validateObjectIdParam("id"), markAsRead);
router.put("/:id/reply", protect, admin, validateObjectIdParam("id"), replyMessage);
router.delete("/:id", protect, admin, validateObjectIdParam("id"), deleteMessage);

module.exports = router;
