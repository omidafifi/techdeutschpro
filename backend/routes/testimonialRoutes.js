const express = require("express");
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  getAllTestimonials,
  setApproval,
  deleteTestimonial,
} = require("../controller/testimonialController");
const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");
const { formLimiter } = require("../middleware/rateLimitMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router
  .route("/")
  .get(getTestimonials)
  .post(formLimiter, optionalProtect, createTestimonial);

router.get("/all", protect, admin, getAllTestimonials);
router.put(
  "/:id/approve",
  protect,
  admin,
  validateObjectIdParam("id"),
  setApproval
);
router.delete(
  "/:id",
  protect,
  admin,
  validateObjectIdParam("id"),
  deleteTestimonial
);

module.exports = router;
