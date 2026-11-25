const Course = require("../models/courseModel");
const Post = require("../models/postModel");
const Resource = require("../models/resourceModel");

// Escape regex special characters to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc   Unified site-wide search across courses, blog posts, and resources
// @route  GET /api/search?q=...
// @access Public
const globalSearch = async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q) {
    return res.json({
      query: "",
      totalResults: 0,
      courses: [],
      posts: [],
      resources: [],
    });
  }

  const regex = new RegExp(escapeRegex(q), "i");

  const [courses, posts, resources] = await Promise.all([
    Course.find({
      isPublished: true,
      $or: [
        { title: regex },
        { shortDescription: regex },
        { description: regex },
        { level: regex },
        { features: regex },
      ],
    })
      .select("title slug level price discountPercent finalPrice isFree image shortDescription")
      .limit(10),

    Post.find({
      isPublished: true,
      $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { tag: regex }],
    })
      .select("title slug category tag excerpt image persianDate views")
      .limit(10),

    Resource.find({
      isPublished: true,
      $or: [{ title: regex }, { description: regex }, { level: regex }],
    })
      .select("title slug description type level url icon")
      .limit(10),
  ]);

  res.json({
    query: q,
    totalResults: courses.length + posts.length + resources.length,
    courses,
    posts,
    resources,
  });
};

module.exports = { globalSearch };
