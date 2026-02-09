const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: "*" }));
app.get("/api/goals", (req, res) => {
  res.send({ message: "Hello from the backend!" });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
