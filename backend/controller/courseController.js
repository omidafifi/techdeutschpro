const asyncHandler = require("express-async-handler");
const Course = require("../models/courseModel");

// @desc   Get all published courses (optional filters: ?level=B1&free=true)
// @route  GET /api/courses
// @access Public
const getCourses = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };

  if (req.query.level) filter.level = req.query.level.toUpperCase();
  if (req.query.free === "true") filter.isFree = true;

  const courses = await Course.find(filter).sort({ level: 1 });
  res.json(courses);
});

// @desc   Get a single course by id or slug
// @route  GET /api/courses/:idOrSlug
// @access Public
const getCourse = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const course = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? await Course.findById(idOrSlug)
    : await Course.findOne({ slug: idOrSlug.toLowerCase() });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.json(course);
});

// @desc   Create a course
// @route  POST /api/courses
// @access Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const { title, slug, level, description, price, discountPercent, isFree, image } =
    req.body;

  if (!title || !slug || !level || price === undefined) {
    res.status(400);
    throw new Error("Please provide title, slug, level and price");
  }

  const course = await Course.create({
    title,
    slug,
    level,
    description,
    price,
    discountPercent,
    isFree,
    image,
  });

  res.status(201).json(course);
});

// @desc   Update a course
// @route  PUT /api/courses/:id
// @access Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  Object.assign(course, req.body);
  const updated = await course.save();
  res.json(updated);
});

// @desc   Delete a course
// @route  DELETE /api/courses/:id
// @access Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await course.deleteOne();
  res.json({ id: req.params.id, message: "Course removed" });
});

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse };
