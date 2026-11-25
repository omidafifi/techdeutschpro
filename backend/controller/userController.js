const User = require("../models/userModel");
const { parsePagination } = require("../middleware/validateMiddleware");

// @desc   List all users (admin)
// @route  GET /api/users
// @access Private/Admin
const getUsers = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20, 100);
  const filter = {};

  if (req.query.role && ["user", "admin"].includes(req.query.role)) {
    filter.role = req.query.role;
  }
  if (req.query.q) {
    const regex = new RegExp(req.query.q.trim(), "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .populate("enrolledCourses", "title slug level")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc   Get user by id (admin)
// @route  GET /api/users/:id
// @access Private/Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("enrolledCourses", "title slug level price");

  if (!user) {
    res.status(404);
    throw new Error("کاربر یافت نشد");
  }

  res.json(user);
};

// @desc   Update user role or active status (admin)
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("کاربر یافت نشد");
  }

  const { role, isActive, name } = req.body;
  if (role !== undefined) {
    if (!["user", "admin"].includes(role)) {
      res.status(400);
      throw new Error("نقش کاربری نامعتبر است");
    }
    user.role = role;
  }
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (name !== undefined) user.name = String(name).trim();

  const updated = await user.save();
  res.json(updated);
};

// @desc   Delete user (admin)
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(400);
    throw new Error("امکان حذف حساب کاربری خودتان وجود ندارد");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("کاربر یافت نشد");
  }

  await user.deleteOne();
  res.json({ id: req.params.id, message: "کاربر با موفقیت حذف شد" });
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
