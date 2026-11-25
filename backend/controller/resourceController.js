const Resource = require("../models/resourceModel");

// @desc   Get all published digital resources (?type=book&level=A1&q=...)
// @route  GET /api/resources
// @access Public
const getResources = async (req, res) => {
  const filter = { isPublished: true };
  if (req.query.type) filter.type = String(req.query.type).toLowerCase();
  if (req.query.level) filter.level = String(req.query.level).toUpperCase();
  if (req.query.q) {
    const regex = new RegExp(String(req.query.q).trim(), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const resources = await Resource.find(filter).sort({ createdAt: -1 });
  res.json(resources);
};

// @desc   Track resource download/visit and return URL
// @route  POST /api/resources/:id/download
// @access Public
const trackDownload = async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadsCount: 1 } },
    { returnDocument: "after" }
  );

  if (!resource) {
    res.status(404);
    throw new Error("منبع آموزشی یافت نشد");
  }

  res.json({
    id: resource._id,
    title: resource.title,
    url: resource.url,
    downloadsCount: resource.downloadsCount,
  });
};

// @desc   Create resource
// @route  POST /api/resources
// @access Private/Admin
const createResource = async (req, res) => {
  const { title, slug, description, type, level, url, icon, color, isFree } =
    req.body;

  if (!title || !slug || !description || !url) {
    res.status(400);
    throw new Error("عنوان، اسلاگ، توضیحات و لینک منبع الزامی هستند");
  }

  const resource = await Resource.create({
    title,
    slug: String(slug).toLowerCase().trim(),
    description,
    type,
    level,
    url,
    icon,
    color,
    isFree,
  });

  res.status(201).json(resource);
};

// @desc   Update resource
// @route  PUT /api/resources/:id
// @access Private/Admin
const updateResource = async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error("منبع آموزشی یافت نشد");
  }

  const allowed = [
    "title",
    "slug",
    "description",
    "type",
    "level",
    "url",
    "icon",
    "color",
    "isFree",
    "isPublished",
  ];
  for (const field of allowed) {
    if (req.body[field] !== undefined) resource[field] = req.body[field];
  }

  const updated = await resource.save();
  res.json(updated);
};

// @desc   Delete resource
// @route  DELETE /api/resources/:id
// @access Private/Admin
const deleteResource = async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error("منبع آموزشی یافت نشد");
  }

  await resource.deleteOne();
  res.json({ id: req.params.id, message: "منبع آموزشی حذف شد" });
};

module.exports = {
  getResources,
  trackDownload,
  createResource,
  updateResource,
  deleteResource,
};
