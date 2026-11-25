const express = require("express");
const router = express.Router();
const { getAdminDashboard } = require("../controller/siteController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, admin, getAdminDashboard);

module.exports = router;
