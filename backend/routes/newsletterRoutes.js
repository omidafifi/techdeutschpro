const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
} = require("../controller/newsletterController");
const { protect, admin } = require("../middleware/authMiddleware");
const { formLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/subscribe", formLimiter, subscribe);
router.post("/unsubscribe", formLimiter, unsubscribe);
router.get("/", protect, admin, getSubscribers);

module.exports = router;
