const Post = require("../models/postModel");
const { isValidObjectId, parsePagination } = require("../middleware/validateMiddleware");

// @desc   Get published blog posts (?category=education|articles|culture|news&tag=...&q=...&page=1&limit=6)
// @route  GET /api/posts
// @access Public
const getPosts = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 10, 50);
  const filter = { isPublished: true };

  if (req.query.category) {
    filter.category = String(req.query.category).toLowerCase().trim();
  }
  if (req.query.tag) {
    filter.tag = String(req.query.tag).trim();
  }
  if (req.query.featured === "true") {
    filter.isFeatured = true;
  }
  if (req.query.q) {
    const regex = new RegExp(String(req.query.q).trim(), "i");
    filter.$or = [
      { title: regex },
      { excerpt: regex },
      { content: regex },
      { tag: regex },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select("-content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc   Get single post by id or slug (increments view count)
// @route  GET /api/posts/:idOrSlug
// @access Public
const getPost = async (req, res) => {
  const { idOrSlug } = req.params;
  const query = isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: String(idOrSlug).toLowerCase() };

  const post = await Post.findOneAndUpdate(
    query,
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  );

  if (!post) {
    res.status(404);
    throw new Error("مطلب مورد نظر یافت نشد");
  }

  res.json(post);
};

// @desc   Create a blog post
// @route  POST /api/posts
// @access Private/Admin
const createPost = async (req, res) => {
  const {
    title,
    slug,
    category,
    tag,
    excerpt,
    content,
    image,
    author,
    persianDate,
    isFeatured,
    isPublished,
  } = req.body;

  if (!title || !slug || !category || !excerpt || !content) {
    res.status(400);
    throw new Error("عنوان، اسلاگ، دسته‌بندی، خلاصه و متن کامل الزامی هستند");
  }

  const post = await Post.create({
    title,
    slug: String(slug).toLowerCase().trim(),
    category: String(category).toLowerCase().trim(),
    tag,
    excerpt,
    content,
    image,
    author,
    persianDate,
    isFeatured,
    isPublished,
  });

  res.status(201).json(post);
};

// @desc   Update a blog post
// @route  PUT /api/posts/:id
// @access Private/Admin
const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("مطلب یافت نشد");
  }

  const allowed = [
    "title",
    "slug",
    "category",
    "tag",
    "excerpt",
    "content",
    "image",
    "author",
    "persianDate",
    "isFeatured",
    "isPublished",
  ];
  for (const field of allowed) {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  }

  const updated = await post.save();
  res.json(updated);
};

// @desc   Delete a blog post
// @route  DELETE /api/posts/:id
// @access Private/Admin
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("مطلب یافت نشد");
  }

  await post.deleteOne();
  res.json({ id: req.params.id, message: "مطلب با موفقیت حذف شد" });
};

// @desc   Add comment to a post
// @route  POST /api/posts/:id/comments
// @access Public (uses req.user if logged in, otherwise authorName)
const addComment = async (req, res) => {
  const { authorName, content } = req.body;

  if (!content || !String(content).trim()) {
    res.status(400);
    throw new Error("متن دیدگاه الزامی است");
  }

  const name = req.user ? req.user.name : String(authorName || "").trim();
  if (!name) {
    res.status(400);
    throw new Error("لطفاً نام خود را وارد کنید");
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("مطلب یافت نشد");
  }

  post.comments.push({
    user: req.user ? req.user._id : null,
    authorName: name,
    content: String(content).trim(),
  });

  await post.save();
  const createdComment = post.comments[post.comments.length - 1];
  res.status(201).json(createdComment);
};

// @desc   Delete a comment
// @route  DELETE /api/posts/:id/comments/:commentId
// @access Private/Admin
const deleteComment = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("مطلب یافت نشد");
  }

  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error("دیدگاه یافت نشد");
  }

  comment.deleteOne();
  await post.save();
  res.json({ message: "دیدگاه حذف شد" });
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
};
