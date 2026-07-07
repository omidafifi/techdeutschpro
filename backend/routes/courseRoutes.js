const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/courseController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getCourses).post(protect, admin, createCourse);
router.get("/:idOrSlug", getCourse);
router
  .route("/:id")
  .put(protect, admin, updateCourse)
  .delete(protect, admin, deleteCourse);

module.exports = router;
