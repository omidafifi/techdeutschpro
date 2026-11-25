const express = require("express");
const router = express.Router();
const {
  createOrder,
  payOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require("../controller/orderController");
const {
  protect,
  optionalProtect,
  admin,
} = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateMiddleware");

router
  .route("/")
  .post(optionalProtect, createOrder)
  .get(protect, admin, getOrders);

router.get("/my", protect, getMyOrders);
router.get("/:id", protect, validateObjectIdParam("id"), getOrderById);
router.post("/:id/pay", optionalProtect, validateObjectIdParam("id"), payOrder);
router.put(
  "/:id/status",
  protect,
  admin,
  validateObjectIdParam("id"),
  updateOrderStatus
);

module.exports = router;
