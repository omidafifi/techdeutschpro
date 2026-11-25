const express = require("express");
const router = express.Router();

const apiCatalog = {
  name: "Tech Deutsch Pro API",
  version: "2.0.0",
  baseUrl: "/api",
  endpoints: {
    health: ["GET /api/health"],
    auth: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me (Private)",
      "PUT /api/auth/me (Private)",
      "PUT /api/auth/change-password (Private)",
      "POST /api/auth/forgot-password",
      "POST /api/auth/reset-password/:token",
      "GET /api/auth/my-courses (Private)",
    ],
    users: [
      "GET /api/users (Admin)",
      "GET /api/users/:id (Admin)",
      "PUT /api/users/:id (Admin)",
      "DELETE /api/users/:id (Admin)",
    ],
    courses: [
      "GET /api/courses (?level=&free=&discounted=&q=&sort=)",
      "GET /api/courses/:idOrSlug",
      "POST /api/courses (Admin)",
      "PUT /api/courses/:id (Admin)",
      "DELETE /api/courses/:id (Admin)",
    ],
    orders: [
      "POST /api/orders (Public/OptionalAuth)",
      "POST /api/orders/:id/pay",
      "GET /api/orders/my (Private)",
      "GET /api/orders/:id (Private)",
      "GET /api/orders (Admin)",
      "PUT /api/orders/:id/status (Admin)",
    ],
    coupons: [
      "POST /api/coupons/validate",
      "GET /api/coupons (Admin)",
      "POST /api/coupons (Admin)",
      "PUT /api/coupons/:id (Admin)",
      "DELETE /api/coupons/:id (Admin)",
    ],
    posts: [
      "GET /api/posts (?category=&tag=&q=&featured=&page=&limit=)",
      "GET /api/posts/:idOrSlug",
      "POST /api/posts (Admin)",
      "PUT /api/posts/:id (Admin)",
      "DELETE /api/posts/:id (Admin)",
      "POST /api/posts/:id/comments",
      "DELETE /api/posts/:id/comments/:commentId (Admin)",
    ],
    resources: [
      "GET /api/resources (?type=&level=&q=)",
      "POST /api/resources/:id/download",
      "POST /api/resources (Admin)",
      "PUT /api/resources/:id (Admin)",
      "DELETE /api/resources/:id (Admin)",
    ],
    testimonials: [
      "GET /api/testimonials",
      "POST /api/testimonials",
      "GET /api/testimonials/all (Admin)",
      "PUT /api/testimonials/:id/approve (Admin)",
      "DELETE /api/testimonials/:id (Admin)",
    ],
    contact: [
      "POST /api/contact",
      "GET /api/contact (Admin)",
      "PUT /api/contact/:id/read (Admin)",
      "PUT /api/contact/:id/reply (Admin)",
      "DELETE /api/contact/:id (Admin)",
    ],
    newsletter: [
      "POST /api/newsletter/subscribe",
      "POST /api/newsletter/unsubscribe",
      "GET /api/newsletter (Admin)",
    ],
    notifications: [
      "GET /api/notifications (Public/OptionalAuth)",
      "PUT /api/notifications/:id/read (Private)",
      "PUT /api/notifications/clear (Private)",
      "POST /api/notifications (Admin)",
    ],
    search: ["GET /api/search?q="],
    chat: ["POST /api/chat", "GET /api/chat/:sessionId"],
    site: [
      "GET /api/site/stats",
      "GET /api/site/faqs (?page=home|contact)",
      "POST /api/site/faqs (Admin)",
      "DELETE /api/site/faqs/:id (Admin)",
    ],
    admin: ["GET /api/admin/dashboard (Admin)"],
    goals: [
      "GET /api/goals",
      "POST /api/goals",
      "PUT /api/goals/:id",
      "DELETE /api/goals/:id",
    ],
  },
};

router.get("/", (req, res) => {
  res.json(apiCatalog);
});

module.exports = router;
