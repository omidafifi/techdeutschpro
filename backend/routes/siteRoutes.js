const express = require("express");
const router = express.Router();
const {
  getSiteStats,
  getFaqs,
  createFaq,
  deleteFaq,
} = require("../controller/siteController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router.get("/stats", getSiteStats);
router.route("/faqs").get(getFaqs).post(protect, admin, createFaq);
router.delete("/faqs/:id", protect, admin, validateObjectIdParam("id"), deleteFaq);

module.exports = router;
