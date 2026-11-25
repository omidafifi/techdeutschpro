const mongoose = require("mongoose");
require("colors");
const env = require("./env");

const connectDB = async (uri = env.mongoUri) => {
  try {
    const conn = await mongoose.connect(uri);
    if (env.nodeEnv !== "test") {
      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`.cyan.underline);
    }
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`.red.bold);
    throw error;
  }
};

module.exports = connectDB;
