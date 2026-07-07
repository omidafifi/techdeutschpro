const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

// Helper: decide if the identifier is an email or a phone number
const splitIdentifier = (identifier = "") => {
  const value = identifier.trim();
  if (value.includes("@")) return { email: value.toLowerCase() };
  return { phone: value };
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
// body: { name, identifier (email or phone), password }
const registerUser = asyncHandler(async (req, res) => {
  const { name, identifier, password } = req.body;

  if (!name || !identifier || !password) {
    res.status(400);
    throw new Error("Please provide name, email/phone and password");
  }

  const idField = splitIdentifier(identifier);

  const existing = await User.findOne(idField);
  if (existing) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, password, ...idField });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
// body: { identifier (email or phone), password }
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Please provide email/phone and password");
  }

  const idField = splitIdentifier(identifier);

  // password has select:false in the schema, so select it explicitly
  const user = await User.findOne(idField).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc   Get logged-in user's profile
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };
