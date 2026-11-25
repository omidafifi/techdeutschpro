const mongoose = require("mongoose");
const env = require("./config/env");
const connectDB = require("./config/db");
const createApp = require("./app");

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(
      `Tech Deutsch Pro server running in ${env.nodeEnv} mode on http://localhost:${env.port}`
    );
    console.log(`API docs available at http://localhost:${env.port}/api/docs`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing HTTP server and MongoDB connection...`);
    server.closeAllConnections?.();
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
