const express = require("express");
const router = express.Router();
const {
  getResources,
  trackDownload,
  createResource,
  updateResource,
  deleteResource,
} = require("../controller/resourceController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router.route("/").get(getResources).post(protect, admin, createResource);
router.post("/:id/download", validateObjectIdParam("id"), trackDownload);
router
  .route("/:id")
  .put(protect, admin, validateObjectIdParam("id"), updateResource)
  .delete(protect, admin, validateObjectIdParam("id"), deleteResource);

module.exports = router;
