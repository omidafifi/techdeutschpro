const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markRead,
  clearAll,
  createNotification,
} = require("../controller/notificationController");
const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router
  .route("/")
  .get(optionalProtect, getNotifications)
  .post(protect, admin, createNotification);

router.put("/clear", protect, clearAll);
router.put("/:id/read", protect, validateObjectIdParam("id"), markRead);

module.exports = router;
