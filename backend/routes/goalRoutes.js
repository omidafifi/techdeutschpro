const express = require("express");
const router = express.Router();
const { getGoals } = require("../controller/goalController");

router.get("/", getGoals);

router.post("/", (req, res) => {
  res.status(200).json({ message: "Set goal" });
});

router.put("/:id", (req, res) => {
  res.status(200).json({ message: `insert or update goal ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: `Delete goal ${req.params.id}` });
});
module.exports = router;
