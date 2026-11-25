const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_key_for_tech_deutsch_pro_123456";
const TEST_MONGO_URI =
  process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/techdeutschpro_test";

const createApp = require("../app");
const User = require("../models/userModel");
const Course = require("../models/courseModel");

let server;
let baseUrl;
let adminToken;
let userToken;
let userId;
let courseId;
let orderId;
let postId;
let resourceId;
let testimonialId;
let contactId;

async function api(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Connection: "close",
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

test.before(async () => {
  await mongoose.connect(TEST_MONGO_URI);
  await mongoose.connection.dropDatabase();

  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // Create an admin user directly in DB for admin route testing
  const admin = await User.create({
    name: "Admin Test",
    email: "admin@test.com",
    password: "AdminPassword123",
    role: "admin",
  });
  assert.ok(admin._id);

  const loginRes = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier: "admin@test.com",
      password: "AdminPassword123",
    }),
  });
  assert.equal(loginRes.status, 200);
  adminToken = loginRes.body.token;
});

test.after(async () => {
  if (server) {
    server.closeAllConnections?.();
    await new Promise((resolve) => {
      server.close(() => resolve());
      setTimeout(resolve, 500);
    });
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close(true);
  }
});

test("1. Health & Docs endpoints respond cleanly", async () => {
  const health = await api("/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.status, "ok");
  assert.equal(health.body.database, "connected");

  const docs = await api("/api/docs");
  assert.equal(docs.status, 200);
  assert.ok(docs.body.endpoints.courses);
});

test("2. Auth flow: register, duplicate check, login, profile update, change & reset password", async () => {
  // Register with email
  const reg = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "سارا تست",
      identifier: "sara@example.com",
      password: "password123",
    }),
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);
  userToken = reg.body.token;
  userId = reg.body._id;

  // Duplicate email should fail with 409
  const dup = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Duplicate",
      identifier: "sara@example.com",
      password: "password123",
    }),
  });
  assert.equal(dup.status, 409);

  // Register with phone number
  const phoneReg = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "علی موبایل",
      identifier: "09123456789",
      password: "password123",
    }),
  });
  assert.equal(phoneReg.status, 201);
  assert.equal(phoneReg.body.phone, "09123456789");

  // Get profile
  const me = await api("/api/auth/me", {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(me.status, 200);
  assert.equal(me.body.email, "sara@example.com");

  // Update profile
  const upd = await api("/api/auth/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ name: "سارا محمدی" }),
  });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.name, "سارا محمدی");

  // Change password
  const chg = await api("/api/auth/change-password", {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      currentPassword: "password123",
      newPassword: "newpassword456",
    }),
  });
  assert.equal(chg.status, 200);

  // Forgot + reset password
  const forgot = await api("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier: "sara@example.com" }),
  });
  assert.equal(forgot.status, 200);
  assert.ok(forgot.body.resetToken);

  const reset = await api(`/api/auth/reset-password/${forgot.body.resetToken}`, {
    method: "POST",
    body: JSON.stringify({ password: "finalpassword789" }),
  });
  assert.equal(reset.status, 200);
  userToken = reset.body.token;
});

test("3. Courses CRUD, filtering, and admin authorization", async () => {
  // Non-admin cannot create course
  const forbidden = await api("/api/courses", {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      title: "Unauthorized",
      slug: "unauth",
      level: "A1",
      price: 1000,
    }),
  });
  assert.equal(forbidden.status, 403);

  // Admin creates course
  const created = await api("/api/courses", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "دوره مقدماتی A1",
      slug: "course-a1",
      level: "A1",
      shortDescription: "شروع یادگیری از پایه",
      price: 2500000,
      discountPercent: 0,
    }),
  });
  assert.equal(created.status, 201);
  courseId = created.body._id;

  // Fetch by slug
  const bySlug = await api("/api/courses/course-a1");
  assert.equal(bySlug.status, 200);
  assert.equal(bySlug.body.finalPrice, 2500000);

  // Filter by level
  const list = await api("/api/courses?level=a1");
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);
});

test("4. Coupons, Orders (tamper-proof pricing), Payment & Auto-Enrollment", async () => {
  // Admin creates 20% coupon
  const couponRes = await api("/api/coupons", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      code: "SUMMER20",
      description: "تخفیف تابستانی",
      discountPercent: 20,
    }),
  });
  assert.equal(couponRes.status, 201);

  // Validate coupon preview
  const validate = await api("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: "summer20", subtotal: 2500000 }),
  });
  assert.equal(validate.status, 200);
  assert.equal(validate.body.discountAmount, 500000);
  assert.equal(validate.body.finalTotal, 2000000);

  // Logged-in user places order trying to tamper price to 1 Toman -> server MUST enforce 2,500,000!
  const orderRes = await api("/api/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      items: [{ id: "course-a1", title: "Fake cheap", price: 1 }],
      payer: {
        fullName: "سارا محمدی",
        phone: "09394962091",
        email: "sara@example.com",
      },
      paymentMethod: "online",
      couponCode: "SUMMER20",
    }),
  });
  assert.equal(orderRes.status, 201);
  assert.equal(orderRes.body.subtotal, 2500000);
  assert.equal(orderRes.body.discountAmount, 500000);
  assert.equal(orderRes.body.totalPrice, 2000000);
  assert.equal(orderRes.body.user, userId);
  orderId = orderRes.body._id;

  // Pay order -> should mark as paid and enroll user in course-a1
  const payRes = await api(`/api/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  assert.equal(payRes.status, 200);
  assert.equal(payRes.body.order.status, "paid");

  // User's enrolled courses should now include course-a1
  const myCourses = await api("/api/auth/my-courses", {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(myCourses.status, 200);
  assert.equal(myCourses.body.length, 1);
  assert.equal(myCourses.body[0].slug, "course-a1");

  // User can view own orders
  const myOrders = await api("/api/orders/my", {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(myOrders.status, 200);
  assert.equal(myOrders.body.length, 1);
});

test("5. Blog Posts, Views counter, Comments & Digital Resources", async () => {
  const postRes = await api("/api/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "نکات کلیدی گرامر آلمانی",
      slug: "german-grammar-tips",
      category: "education",
      tag: "گرامر",
      excerpt: "خلاصه نکات مهم گرامر",
      content: "متن کامل مقاله آموزش گرامر آلمانی...",
    }),
  });
  assert.equal(postRes.status, 201);
  postId = postRes.body._id;

  // Reading post increments views
  const readPost = await api("/api/posts/german-grammar-tips");
  assert.equal(readPost.status, 200);
  assert.equal(readPost.body.views, 1);

  // Add comment as logged-in user
  const commentRes = await api(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ content: "مقاله بسیار کاربردی بود!" }),
  });
  assert.equal(commentRes.status, 201);
  assert.equal(commentRes.body.authorName, "سارا محمدی");

  // Create resource & track download
  const resCreate = await api("/api/resources", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: "کتاب‌های Menschen",
      slug: "menschen",
      description: "متد محبوب آموزش آلمانی",
      type: "book",
      level: "A1",
      url: "https://www.hueber.de/menschen",
    }),
  });
  assert.equal(resCreate.status, 201);
  resourceId = resCreate.body._id;

  const dl = await api(`/api/resources/${resourceId}/download`, {
    method: "POST",
  });
  assert.equal(dl.status, 200);
  assert.equal(dl.body.downloadsCount, 1);
});

test("6. Testimonials, Contact, Newsletter, Notifications, Search, Chatbot & Dashboard", async () => {
  // Testimonial submit & admin approve
  const tSubmit = await api("/api/testimonials", {
    method: "POST",
    body: JSON.stringify({
      name: "رضا کریمی",
      courseLevel: "دانشجوی B2",
      rating: 5,
      comment: "عالی بود!",
    }),
  });
  assert.equal(tSubmit.status, 201);
  testimonialId = tSubmit.body.testimonial._id;

  const tPublicBefore = await api("/api/testimonials");
  assert.equal(tPublicBefore.body.length, 0);

  const tApprove = await api(`/api/testimonials/${testimonialId}/approve`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ isApproved: true }),
  });
  assert.equal(tApprove.status, 200);

  const tPublicAfter = await api("/api/testimonials");
  assert.equal(tPublicAfter.body.length, 1);

  // Contact form submit + admin reply
  const contactRes = await api("/api/contact", {
    method: "POST",
    body: JSON.stringify({
      name: "مریم احمدی",
      contact: "09120001122",
      message: "سلام، برای تعیین سطح وقت مشاوره می‌خواهم.",
    }),
  });
  assert.equal(contactRes.status, 201);
  contactId = contactRes.body._id;

  const replyRes = await api(`/api/contact/${contactId}/reply`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ adminReply: "تماس گرفته شد و وقت مشاوره ثبت شد." }),
  });
  assert.equal(replyRes.status, 200);
  assert.equal(replyRes.body.isRead, true);

  // Newsletter subscribe & unsubscribe
  const sub = await api("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email: "reader@example.com" }),
  });
  assert.equal(sub.status, 201);

  const unsub = await api("/api/newsletter/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ email: "reader@example.com" }),
  });
  assert.equal(unsub.status, 200);

  // Notifications for logged-in user (should have order + payment notifications)
  const notifs = await api("/api/notifications", {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(notifs.status, 200);
  assert.ok(notifs.body.unreadCount >= 2);

  const clear = await api("/api/notifications/clear", {
    method: "PUT",
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(clear.status, 200);

  // Global search
  const search = await api("/api/search?q=" + encodeURIComponent("A1"));
  assert.equal(search.status, 200);
  assert.ok(search.body.courses.length >= 1);
  assert.ok(search.body.resources.length >= 1);

  // Smart chatbot
  const chat = await api("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: "قیمت دوره A1 چقدره؟" }),
  });
  assert.equal(chat.status, 201);
  assert.ok(chat.body.reply.includes("2,500,000"));

  const history = await api(`/api/chat/${chat.body.sessionId}`);
  assert.equal(history.status, 200);
  assert.equal(history.body.messages.length, 2);

  // Site stats & Admin dashboard
  const stats = await api("/api/site/stats");
  assert.equal(stats.status, 200);
  assert.equal(stats.body.live.completedOrders, 1);

  const dash = await api("/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(dash.status, 200);
  assert.equal(dash.body.summary.totalRevenue, 2000000);
  assert.equal(dash.body.summary.paidOrders, 1);

  // Legacy goals route still works
  const goals = await api("/api/goals");
  assert.equal(goals.status, 200);

  // Verify Course studentsCount incremented on enrollment
  const refreshedCourse = await Course.findById(courseId);
  assert.equal(refreshedCourse.studentsCount, 1);
});
