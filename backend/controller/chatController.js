const crypto = require("crypto");
const ChatMessage = require("../models/chatMessageModel");
const Course = require("../models/courseModel");
const Coupon = require("../models/couponModel");
const Faq = require("../models/faqModel");

const generateSmartReply = async (text) => {
  const msg = String(text || "").toLowerCase();

  // Greetings
  if (/^(سلام|درود|های|hi|hello|hallo|guten)/i.test(msg.trim())) {
    return "سلام! 👋 خوش اومدید به Tech Deutsch Pro. می‌تونید درباره دوره‌ها (A1 تا B2)، قیمت‌ها، کد تخفیف، مدت زمان کلاس‌ها یا مشاوره رایگان سوال بپرسید!";
  }

  // Discount / coupon inquiries
  if (/(تخفیف|کد|کوپن|off|discount|rabatt)/.test(msg)) {
    const activeCoupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).limit(2);

    if (activeCoupons.length > 0) {
      const list = activeCoupons
        .map((c) => `کد «${c.code}» (${c.discountPercent}% تخفیف)`)
        .join(" و ");
      return `الان کد تخفیف فعال داریم! 🎉 می‌تونید در صفحه تسویه حساب از ${list} استفاده کنید.`;
    }
    return "در حال حاضر تخفیف‌ها مستقیماً روی صفحه دوره‌ها اطلاع‌رسانی می‌شوند. برای اطلاع سریع‌تر در خبرنامه عضو بشید!";
  }

  // Specific course level inquiry (A1, A2, B1, B2)
  const levelMatch = msg.match(/\b(a1|a2|b1|b2|c1)\b/i);
  if (levelMatch) {
    const level = levelMatch[1].toUpperCase();
    const course = await Course.findOne({ level, isPublished: true });
    if (course) {
      return `📘 ${course.title} (سطح ${course.level}): ${course.shortDescription || course.description}. مدت دوره: ${course.duration} (${course.sessionsCount} جلسه) — شهریه: ${course.finalPrice.toLocaleString()} تومان. از بخش دوره‌ها می‌تونید به سبد خرید اضافه کنید!`;
    }
  }

  // Courses & pricing overview
  if (/(دوره|قیمت|شهریه|هزینه|کلاس|ثبت.?نام|course|kurs|preis)/.test(msg)) {
    const courses = await Course.find({ isPublished: true }).sort({ level: 1 });
    if (courses.length > 0) {
      const summary = courses
        .map((c) => `• ${c.title}: ${c.finalPrice.toLocaleString()} تومان`)
        .join("\n");
      return `دوره‌های فعال Tech Deutsch Pro:\n${summary}\n\nهر دوره به طور متوسط ۳ ماه (۴۸ جلسه ۹۰ دقیقه‌ای) است. درباره کدام سطح اطلاعات بیشتری می‌خواهید؟`;
    }
  }

  // Contact / consultation / phone / address
  if (/(تماس|شماره|تلفن|مشاوره|آدرس|واتساپ|تلگرام|contact|phone)/.test(msg)) {
    return "📞 شماره تماس و واتساپ: 09394962091\n📧 ایمیل: info@techdeutschpro.com\n📍 آدرس: شیراز، بلوار جمهوری، ساختمان نوآوری دانشگاه شیراز\nهمچنین از صفحه «تماس با ما» می‌تونید فرم مشاوره رایگان رو پر کنید.";
  }

  // Instructor / about
  if (/(مدرس|استاد|امید|عفیفی|درباره)/.test(msg)) {
    return "امید عفیفی، موسس و مدرس ارشد Tech Deutsch Pro با بیش از ۷ سال سابقه تدریس و بیش از ۲۱۰۰ دانشجوی موفق، دوره‌های آلمانی با تمرکز بر حوزه فناوری و مهاجرت کاری تدریس می‌کنند.";
  }

  // Search matching FAQ from DB
  const faqs = await Faq.find({ isPublished: true });
  const words = msg.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length > 0) {
    let bestFaq = null;
    let bestScore = 0;
    for (const faq of faqs) {
      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        bestFaq = faq;
      }
    }
    if (bestFaq && bestScore >= 2) {
      return `${bestFaq.question}\n${bestFaq.answer}`;
    }
  }

  return "ممنون از پیام شما! 😊 می‌تونید درباره دوره‌های A1 تا B2، شهریه‌ها، کد تخفیف، یا نحوه ثبت‌نام بپرسید؛ یا از طریق صفحه «تماس با ما» برای مشاوره رایگان با امید عفیفی در ارتباط باشید.";
};

// @desc   Send a message to the support chatbot
// @route  POST /api/chat
// @access Public
const sendChatMessage = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !String(message).trim()) {
    res.status(400);
    throw new Error("متن پیام نمی‌تواند خالی باشد");
  }

  const sid = sessionId
    ? String(sessionId).trim()
    : `sess_${crypto.randomBytes(6).toString("hex")}`;
  const cleanMessage = String(message).trim();

  await ChatMessage.create({
    sessionId: sid,
    user: req.user ? req.user._id : null,
    role: "user",
    message: cleanMessage,
  });

  const reply = await generateSmartReply(cleanMessage);

  const botMsg = await ChatMessage.create({
    sessionId: sid,
    user: req.user ? req.user._id : null,
    role: "bot",
    message: reply,
  });

  res.status(201).json({
    sessionId: sid,
    reply,
    timestamp: botMsg.createdAt,
  });
};

// @desc   Get chat history for a session
// @route  GET /api/chat/:sessionId
// @access Public
const getChatHistory = async (req, res) => {
  const messages = await ChatMessage.find({
    sessionId: req.params.sessionId,
  })
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({ sessionId: req.params.sessionId, messages });
};

module.exports = { sendChatMessage, getChatHistory };
