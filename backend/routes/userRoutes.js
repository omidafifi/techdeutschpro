const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router.use(protect, admin);

router.get("/", getUsers);
router
  .route("/:id")
  .get(validateObjectIdParam("id"), getUserById)
  .put(validateObjectIdParam("id"), updateUser)
  .delete(validateObjectIdParam("id"), deleteUser);

module.exports = router;
