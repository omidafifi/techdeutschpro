const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const env = require("../config/env");
const {
  isValidEmail,
  isValidPhone,
  normalizePhone,
} = require("../middleware/validateMiddleware");

const generateToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

// Decide whether identifier is email or phone
const parseIdentifier = (identifier = "") => {
  const value = String(identifier).trim();
  if (!value) return null;
  if (value.includes("@")) {
    if (!isValidEmail(value)) {
      return { error: "فرمت ایمیل نامعتبر است" };
    }
    return { field: { email: value.toLowerCase() } };
  }
  const normalized = normalizePhone(value);
  if (!isValidPhone(normalized)) {
    return { error: "فرمت شماره موبایل نامعتبر است (مثال: 09123456789)" };
  }
  return { field: { phone: normalized } };
};

const formatUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  avatar: user.avatar || "",
  enrolledCourses: user.enrolledCourses || [],
  ...(token ? { token } : {}),
});

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  const { name, identifier, email, phone, password } = req.body;

  if (!name || !password || (!identifier && !email && !phone)) {
    res.status(400);
    throw new Error("لطفاً نام، ایمیل یا شماره موبایل و رمز عبور را وارد کنید");
  }

  if (String(password).length < 6) {
    res.status(400);
    throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد");
  }

  let contactFields = {};
  if (identifier) {
    const parsed = parseIdentifier(identifier);
    if (!parsed || parsed.error) {
      res.status(400);
      throw new Error(parsed?.error || "ایمیل یا شماره موبایل نامعتبر است");
    }
    contactFields = parsed.field;
  } else {
    if (email) {
      if (!isValidEmail(email)) {
        res.status(400);
        throw new Error("فرمت ایمیل نامعتبر است");
      }
      contactFields.email = String(email).trim().toLowerCase();
    }
    if (phone) {
      const normalized = normalizePhone(phone);
      if (!isValidPhone(normalized)) {
        res.status(400);
        throw new Error("فرمت شماره موبایل نامعتبر است");
      }
      contactFields.phone = normalized;
    }
  }

  const orConditions = [];
  if (contactFields.email) orConditions.push({ email: contactFields.email });
  if (contactFields.phone) orConditions.push({ phone: contactFields.phone });

  const existing = await User.findOne({ $or: orConditions });
  if (existing) {
    res.status(409);
    throw new Error("کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است");
  }

  const user = await User.create({
    name: String(name).trim(),
    password,
    ...contactFields,
  });

  res.status(201).json(formatUserResponse(user, generateToken(user._id)));
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  const { identifier, email, phone, password } = req.body;
  const rawIdentifier = identifier || email || phone;

  if (!rawIdentifier || !password) {
    res.status(400);
    throw new Error("لطفاً ایمیل یا شماره موبایل و رمز عبور را وارد کنید");
  }

  const parsed = parseIdentifier(rawIdentifier);
  if (!parsed || parsed.error) {
    res.status(400);
    throw new Error(parsed?.error || "شناسه کاربری نامعتبر است");
  }

  const user = await User.findOne(parsed.field).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("ایمیل/شماره موبایل یا رمز عبور اشتباه است");
  }

  if (user.isActive === false) {
    res.status(403);
    throw new Error("حساب کاربری شما غیرفعال شده است");
  }

  res.json(formatUserResponse(user, generateToken(user._id)));
};

// @desc   Get logged-in user's profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("enrolledCourses", "title slug level price finalPrice image duration");
  res.json(user);
};

// @desc   Update logged-in user's profile
// @route  PUT /api/auth/me
// @access Private
const updateProfile = async (req, res) => {
  const { name, email, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = String(name).trim();
  if (avatar !== undefined) user.avatar = String(avatar).trim();

  if (email !== undefined && email !== "") {
    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("فرمت ایمیل نامعتبر است");
    }
    user.email = String(email).trim().toLowerCase();
  }

  if (phone !== undefined && phone !== "") {
    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      res.status(400);
      throw new Error("فرمت شماره موبایل نامعتبر است");
    }
    user.phone = normalized;
  }

  const updated = await user.save();
  res.json(formatUserResponse(updated));
};

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("رمز عبور فعلی و رمز عبور جدید الزامی هستند");
  }

  if (String(newPassword).length < 6) {
    res.status(400);
    throw new Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("رمز عبور فعلی اشتباه است");
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "رمز عبور با موفقیت تغییر یافت",
    token: generateToken(user._id),
  });
};

// @desc   Request password reset token
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    res.status(400);
    throw new Error("لطفاً ایمیل یا شماره موبایل خود را وارد کنید");
  }

  const parsed = parseIdentifier(identifier);
  if (!parsed || parsed.error) {
    res.status(400);
    throw new Error(parsed?.error || "شناسه نامعتبر است");
  }

  const user = await User.findOne(parsed.field);
  if (!user) {
    // Avoid leaking whether an account exists
    return res.json({
      success: true,
      message: "اگر حسابی با این مشخصات وجود داشته باشد، کد بازیابی ارسال خواهد شد.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "لینک/کد بازیابی رمز عبور ایجاد شد.",
    // Exposed only outside production for local development & testing
    ...(env.nodeEnv !== "production" ? { resetToken } : {}),
  });
};

// @desc   Reset password using token
// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < 6) {
    res.status(400);
    throw new Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("توکن بازیابی نامعتبر یا منقضی شده است");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: "رمز عبور شما با موفقیت بازنشانی شد",
    token: generateToken(user._id),
  });
};

// @desc   Get enrolled courses for current user
// @route  GET /api/auth/my-courses
// @access Private
const getMyCourses = async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "enrolledCourses",
    "title slug level shortDescription duration sessionsCount instructor image price finalPrice"
  );
  res.json(user.enrolledCourses || []);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getMyCourses,
};
