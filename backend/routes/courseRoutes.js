const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/courseController");
const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router
  .route("/")
  .get(optionalProtect, getCourses)
  .post(protect, admin, createCourse);

router.get("/:idOrSlug", getCourse);

router
  .route("/:id")
  .put(protect, admin, validateObjectIdParam("id"), updateCourse)
  .delete(protect, admin, validateObjectIdParam("id"), deleteCourse);

module.exports = router;
