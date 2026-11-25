const Testimonial = require("../models/testimonialModel");

// @desc   Get approved student testimonials
// @route  GET /api/testimonials
// @access Public
const getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find({ isApproved: true }).sort({
    createdAt: -1,
  });
  res.json(testimonials);
};

// @desc   Submit a new testimonial (requires admin approval unless submitted by admin)
// @route  POST /api/testimonials
// @access Public (uses logged-in user if present)
const createTestimonial = async (req, res) => {
  const { name, courseLevel, rating, comment, avatar } = req.body;
  const authorName = req.user ? req.user.name : String(name || "").trim();

  if (!authorName || !comment) {
    res.status(400);
    throw new Error("نام و متن نظر الزامی هستند");
  }

  const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));

  const testimonial = await Testimonial.create({
    user: req.user ? req.user._id : null,
    name: authorName,
    courseLevel: courseLevel ? String(courseLevel).trim() : "دانشجوی دوره آلمانی",
    rating: parsedRating,
    comment: String(comment).trim(),
    avatar:
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=DD0000&color=fff&size=60`,
    isApproved: Boolean(req.user && req.user.role === "admin"),
  });

  res.status(201).json({
    message: testimonial.isApproved
      ? "نظر با موفقیت ثبت و منتشر شد"
      : "نظر شما ثبت شد و پس از تایید مدیریت نمایش داده خواهد شد",
    testimonial,
  });
};

// @desc   Get all testimonials (including pending)
// @route  GET /api/testimonials/all
// @access Private/Admin
const getAllTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
  res.json(testimonials);
};

// @desc   Approve or hide a testimonial
// @route  PUT /api/testimonials/:id/approve
// @access Private/Admin
const setApproval = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("نظر مورد نظر یافت نشد");
  }

  testimonial.isApproved =
    req.body.isApproved !== undefined ? Boolean(req.body.isApproved) : true;
  const updated = await testimonial.save();
  res.json(updated);
};

// @desc   Delete testimonial
// @route  DELETE /api/testimonials/:id
// @access Private/Admin
const deleteTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error("نظر مورد نظر یافت نشد");
  }

  await testimonial.deleteOne();
  res.json({ id: req.params.id, message: "نظر با موفقیت حذف شد" });
};

module.exports = {
  getTestimonials,
  createTestimonial,
  getAllTestimonials,
  setApproval,
  deleteTestimonial,
};
