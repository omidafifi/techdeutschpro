const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controller/searchController");

router.get("/", globalSearch);

module.exports = router;
