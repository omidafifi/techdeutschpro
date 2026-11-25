const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
} = require("../controller/postController");
const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");
const { formLimiter } = require("../middleware/rateLimitMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router.route("/").get(getPosts).post(protect, admin, createPost);
router.get("/:idOrSlug", getPost);

router
  .route("/:id")
  .put(protect, admin, validateObjectIdParam("id"), updatePost)
  .delete(protect, admin, validateObjectIdParam("id"), deletePost);

router.post(
  "/:id/comments",
  formLimiter,
  optionalProtect,
  validateObjectIdParam("id"),
  addComment
);
router.delete(
  "/:id/comments/:commentId",
  protect,
  admin,
  validateObjectIdParam("id"),
  deleteComment
);

module.exports = router;
