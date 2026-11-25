const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const { getHealth } = require("./controller/siteController");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const createApp = () => {
  const app = express();

  // Security headers (CSP disabled so frontend CDN assets like Tailwind/FontAwesome work cleanly)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","),
      credentials: true,
    })
  );

  // Request logging in development
  if (env.nodeEnv === "development") {
    app.use(morgan("dev"));
  }

  // Body parsers with payload size limit
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  // Apply general rate limiting to API routes
  app.use("/api", apiLimiter);

  // Health & API documentation
  app.get("/api/health", getHealth);
  app.use("/api/docs", require("./routes/docsRoutes"));

  // Core API routes
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/courses", require("./routes/courseRoutes"));
  app.use("/api/orders", require("./routes/orderRoutes"));
  app.use("/api/coupons", require("./routes/couponRoutes"));
  app.use("/api/posts", require("./routes/postRoutes"));
  app.use("/api/resources", require("./routes/resourceRoutes"));
  app.use("/api/testimonials", require("./routes/testimonialRoutes"));
  app.use("/api/contact", require("./routes/contactRoutes"));
  app.use("/api/newsletter", require("./routes/newsletterRoutes"));
  app.use("/api/notifications", require("./routes/notificationRoutes"));
  app.use("/api/search", require("./routes/searchRoutes"));
  app.use("/api/chat", require("./routes/chatRoutes"));
  app.use("/api/site", require("./routes/siteRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));
  app.use("/api/goals", require("./routes/goalRoutes"));

  // Serve the frontend statically so the entire site runs from one server
  const frontendDir = path.join(__dirname, "..", "frontend");
  app.use(express.static(frontendDir));

  // Fallback for unknown API routes (404 JSON) and error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
