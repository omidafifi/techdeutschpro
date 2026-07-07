const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
  markAsRead,
} = require("../controller/contactController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(createMessage).get(protect, admin, getMessages);
router.put("/:id/read", protect, admin, markAsRead);

module.exports = router;
