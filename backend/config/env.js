const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load .env from backend/ first, then fallback to project root if present
const backendEnv = path.join(__dirname, "..", ".env");
const rootEnv = path.join(__dirname, "..", "..", ".env");

if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/techdeutschpro",
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "tdp_dev_fallback_secret_please_set_in_env"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

module.exports = env;
