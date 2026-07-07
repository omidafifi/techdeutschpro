const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require("../controller/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(createOrder).get(protect, admin, getOrders);
router.get("/my", protect, getMyOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
