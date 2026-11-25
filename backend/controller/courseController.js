const Course = require("../models/courseModel");
const { isValidObjectId } = require("../middleware/validateMiddleware");

// @desc   Get all published courses (filters: ?level=B1&free=true&discounted=true&q=...&sort=price_asc|price_desc|level)
// @route  GET /api/courses
// @access Public
const getCourses = async (req, res) => {
  const filter = {};
  if (!(req.user && req.user.role === "admin" && req.query.includeDrafts === "true")) {
    filter.isPublished = true;
  }

  if (req.query.level) {
    filter.level = String(req.query.level).toUpperCase();
  }
  if (req.query.free === "true") {
    filter.isFree = true;
  }
  if (req.query.discounted === "true") {
    filter.discountPercent = { $gt: 0 };
  }
  if (req.query.q) {
    const regex = new RegExp(String(req.query.q).trim(), "i");
    filter.$or = [
      { title: regex },
      { shortDescription: regex },
      { description: regex },
      { level: regex },
      { features: regex },
    ];
  }

  let sortOption = { level: 1, createdAt: 1 };
  if (req.query.sort === "price_asc") sortOption = { price: 1 };
  if (req.query.sort === "price_desc") sortOption = { price: -1 };
  if (req.query.sort === "newest") sortOption = { createdAt: -1 };
  if (req.query.sort === "popular") sortOption = { studentsCount: -1 };

  const courses = await Course.find(filter).sort(sortOption);
  res.json(courses);
};

// @desc   Get single course by ObjectId or slug
// @route  GET /api/courses/:idOrSlug
// @access Public
const getCourse = async (req, res) => {
  const { idOrSlug } = req.params;

  const course = isValidObjectId(idOrSlug)
    ? await Course.findById(idOrSlug)
    : await Course.findOne({ slug: String(idOrSlug).toLowerCase() });

  if (!course) {
    res.status(404);
    throw new Error("دوره مورد نظر یافت نشد");
  }

  res.json(course);
};

// @desc   Create a course
// @route  POST /api/courses
// @access Private/Admin
const createCourse = async (req, res) => {
  const {
    title,
    slug,
    level,
    badge,
    colorTheme,
    shortDescription,
    description,
    features,
    syllabus,
    duration,
    sessionsCount,
    instructor,
    price,
    discountPercent,
    isFree,
    image,
    isPublished,
  } = req.body;

  if (!title || !slug || !level || price === undefined) {
    res.status(400);
    throw new Error("عنوان، اسلاگ، سطح و قیمت دوره الزامی هستند");
  }

  const course = await Course.create({
    title,
    slug: String(slug).toLowerCase().trim(),
    level: String(level).toUpperCase().trim(),
    badge,
    colorTheme,
    shortDescription,
    description,
    features,
    syllabus,
    duration,
    sessionsCount,
    instructor,
    price,
    discountPercent,
    isFree,
    image,
    isPublished,
  });

  res.status(201).json(course);
};

// @desc   Update a course
// @route  PUT /api/courses/:id
// @access Private/Admin
const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("دوره مورد نظر یافت نشد");
  }

  const allowedFields = [
    "title",
    "slug",
    "level",
    "badge",
    "colorTheme",
    "shortDescription",
    "description",
    "features",
    "syllabus",
    "duration",
    "sessionsCount",
    "instructor",
    "price",
    "discountPercent",
    "isFree",
    "image",
    "studentsCount",
    "rating",
    "isPublished",
  ];

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      course[key] = req.body[key];
    }
  }

  const updated = await course.save();
  res.json(updated);
};

// @desc   Delete a course
// @route  DELETE /api/courses/:id
// @access Private/Admin
const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("دوره مورد نظر یافت نشد");
  }

  await course.deleteOne();
  res.json({ id: req.params.id, message: "دوره با موفقیت حذف شد" });
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
