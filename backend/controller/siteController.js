const mongoose = require("mongoose");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const Order = require("../models/orderModel");
const Post = require("../models/postModel");
const Resource = require("../models/resourceModel");
const ContactMessage = require("../models/contactModel");
const NewsletterSubscriber = require("../models/newsletterModel");
const Testimonial = require("../models/testimonialModel");
const Faq = require("../models/faqModel");

// @desc   API health check
// @route  GET /api/health
// @access Public
const getHealth = (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  res.json({
    status: "ok",
    service: "Tech Deutsch Pro API",
    database: dbState,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

// @desc   Public site stats (combines academy historical baseline + live DB metrics)
// @route  GET /api/site/stats
// @access Public
const getSiteStats = async (req, res) => {
  const [usersCount, coursesCount, postsCount, paidOrdersCount] =
    await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({ isPublished: true }),
      Post.countDocuments({ isPublished: true }),
      Order.countDocuments({ status: "paid" }),
    ]);

  res.json({
    yearsExperience: 7,
    successfulStudents: 2100 + paidOrdersCount,
    totalStudents: 2300 + usersCount,
    coursesHeld: 1400,
    satisfactionPercent: 100,
    live: {
      activeCourses: coursesCount,
      publishedPosts: postsCount,
      registeredUsers: usersCount,
      completedOrders: paidOrdersCount,
    },
  });
};

// @desc   Get published FAQs (?page=home|contact|all)
// @route  GET /api/site/faqs
// @access Public
const getFaqs = async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.page && ["home", "contact"].includes(req.query.page)) {
    filter.page = { $in: [req.query.page, "all"] };
  }

  const faqs = await Faq.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(faqs);
};

// @desc   Create FAQ
// @route  POST /api/site/faqs
// @access Private/Admin
const createFaq = async (req, res) => {
  const { question, answer, page, order } = req.body;
  if (!question || !answer) {
    res.status(400);
    throw new Error("سوال و پاسخ الزامی هستند");
  }

  const faq = await Faq.create({ question, answer, page, order });
  res.status(201).json(faq);
};

// @desc   Delete FAQ
// @route  DELETE /api/site/faqs/:id
// @access Private/Admin
const deleteFaq = async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    res.status(404);
    throw new Error("سوال یافت نشد");
  }
  await faq.deleteOne();
  res.json({ id: req.params.id, message: "سوال متداول حذف شد" });
};

// @desc   Admin dashboard overview analytics
// @route  GET /api/admin/dashboard
// @access Private/Admin
const getAdminDashboard = async (req, res) => {
  const [
    totalUsers,
    totalCourses,
    totalOrders,
    paidOrdersAgg,
    pendingOrders,
    totalPosts,
    totalResources,
    unreadContacts,
    activeSubscribers,
    pendingTestimonials,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({}),
    Course.countDocuments({}),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ status: "pending" }),
    Post.countDocuments({}),
    Resource.countDocuments({}),
    ContactMessage.countDocuments({ isRead: false }),
    NewsletterSubscriber.countDocuments({ isActive: true }),
    Testimonial.countDocuments({ isApproved: false }),
    Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber payer.fullName totalPrice status paymentMethod createdAt"),
  ]);

  const paidStats = paidOrdersAgg[0] || { revenue: 0, count: 0 };

  res.json({
    summary: {
      totalUsers,
      totalCourses,
      totalOrders,
      paidOrders: paidStats.count,
      pendingOrders,
      totalRevenue: paidStats.revenue,
      totalPosts,
      totalResources,
      unreadContacts,
      activeSubscribers,
      pendingTestimonials,
    },
    recentOrders,
  });
};

module.exports = {
  getHealth,
  getSiteStats,
  getFaqs,
  createFaq,
  deleteFaq,
  getAdminDashboard,
};
