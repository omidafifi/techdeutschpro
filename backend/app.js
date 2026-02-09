const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();

app.use("/api/goals", require("./routes/goalRoutes"));

app.listen(port, () => console.log(`Server is running on port ${port}`));
