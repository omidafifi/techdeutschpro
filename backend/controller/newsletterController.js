const NewsletterSubscriber = require("../models/newsletterModel");
const { isValidEmail } = require("../middleware/validateMiddleware");

// @desc   Subscribe to the newsletter
// @route  POST /api/newsletter/subscribe
// @access Public
const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400);
    throw new Error("لطفاً یک ایمیل معتبر وارد کنید");
  }

  const normalized = String(email).trim().toLowerCase();
  const existing = await NewsletterSubscriber.findOne({ email: normalized });

  if (existing) {
    if (existing.isActive) {
      return res.status(200).json({
        alreadySubscribed: true,
        message: "این ایمیل قبلاً در خبرنامه عضو شده است.",
      });
    }
    existing.isActive = true;
    await existing.save();
    return res.status(200).json({
      message: "عضویت شما در خبرنامه مجدداً فعال شد!",
    });
  }

  await NewsletterSubscriber.create({ email: normalized });

  res.status(201).json({
    message: "عضویت شما در خبرنامه با موفقیت انجام شد!",
  });
};

// @desc   Unsubscribe from the newsletter
// @route  POST /api/newsletter/unsubscribe
// @access Public
const unsubscribe = async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    res.status(400);
    throw new Error("ایمیل نامعتبر است");
  }

  const sub = await NewsletterSubscriber.findOneAndUpdate(
    { email: String(email).trim().toLowerCase() },
    { isActive: false },
    { returnDocument: "after" }
  );

  if (!sub) {
    res.status(404);
    throw new Error("این ایمیل در خبرنامه یافت نشد");
  }

  res.json({ message: "لغو عضویت در خبرنامه با موفقیت انجام شد" });
};

// @desc   List all newsletter subscribers
// @route  GET /api/newsletter
// @access Private/Admin
const getSubscribers = async (req, res) => {
  const filter = req.query.activeOnly === "true" ? { isActive: true } : {};
  const subscribers = await NewsletterSubscriber.find(filter).sort({
    createdAt: -1,
  });
  res.json({
    total: subscribers.length,
    subscribers,
  });
};

module.exports = { subscribe, unsubscribe, getSubscribers };
