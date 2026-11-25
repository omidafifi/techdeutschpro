const express = require("express");
const router = express.Router();
const {
  sendChatMessage,
  getChatHistory,
} = require("../controller/chatController");
const { optionalProtect } = require("../middleware/authMiddleware");
const { formLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/", formLimiter, optionalProtect, sendChatMessage);
router.get("/:sessionId", getChatHistory);

module.exports = router;
