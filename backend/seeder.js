// Comprehensive Database Seeder for Tech Deutsch Pro
// Usage:
//   npm run seed          -> seeds admin, courses, coupons, posts, resources, testimonials, faqs, notifications
//   npm run seed:destroy  -> clears seeded collections

const mongoose = require("mongoose");
const env = require("./config/env");
const User = require("./models/userModel");
const Course = require("./models/courseModel");
const Coupon = require("./models/couponModel");
const Post = require("./models/postModel");
const Resource = require("./models/resourceModel");
const Testimonial = require("./models/testimonialModel");
const Faq = require("./models/faqModel");
const Notification = require("./models/notificationModel");

const courses = [
  {
    title: "دوره مقدماتی A1",
    slug: "course-a1",
    level: "A1",
    badge: "پرطرفدار",
    colorTheme: "blue",
    shortDescription: "شروع یادگیری از پایه",
    description:
      "دوره جامع سطح A1 ویژه مبتدیان و فارسی‌زبانان. شامل آموزش الفبا، تلفظ استاندارد، مکالمات روزمره و گرامر پایه.",
    features: ["آموزش الفبا و تلفظ", "مکالمات روزمره", "گرامر پایه"],
    syllabus: [
      { title: "فصل ۱: الفبا، تلفظ و احوالپرسی", lessonsCount: 10, durationMinutes: 90 },
      { title: "فصل ۲: ساختار جمله و صرف افعال پایه", lessonsCount: 14, durationMinutes: 90 },
      { title: "فصل ۳: خرید، زمان، خانواده و زندگی روزمره", lessonsCount: 14, durationMinutes: 90 },
      { title: "فصل ۴: جمع‌بندی و آمادگی آزمون Start Deutsch 1", lessonsCount: 10, durationMinutes: 90 },
    ],
    duration: "۳ ماه",
    sessionsCount: 48,
    instructor: "امید عفیفی",
    price: 2500000,
    discountPercent: 0,
    isFree: false,
    image: "https://ui-avatars.com/api/?name=A+1&background=2563EB&color=fff&size=128",
    studentsCount: 680,
    rating: 5,
  },
  {
    title: "دوره ابتدایی A2",
    slug: "course-a2",
    level: "A2",
    badge: "ابتدایی",
    colorTheme: "green",
    shortDescription: "تقویت مهارت‌های اولیه",
    description:
      "ادامه مسیر یادگیری تا سطح A2؛ توسعه واژگان، مکالمه در موقعیت‌های مختلف و تسلط بر گرامر متوسط.",
    features: ["توسعه واژگان", "مکالمه در موقعیت‌های مختلف", "گرامر متوسط"],
    syllabus: [
      { title: "فصل ۱: زمان گذشته (Perfekt & Präteritum)", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۲: جملات پیرو (Nebensätze) و حروف ربط", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۳: مکالمات کاری، سفر و قرار ملاقات", lessonsCount: 14, durationMinutes: 90 },
      { title: "فصل ۴: تمرین آزمون Goethe-Zertifikat A2", lessonsCount: 10, durationMinutes: 90 },
    ],
    duration: "۳ ماه",
    sessionsCount: 48,
    instructor: "امید عفیفی",
    price: 3200000,
    discountPercent: 0,
    isFree: false,
    image: "https://ui-avatars.com/api/?name=A+2&background=16A34A&color=fff&size=128",
    studentsCount: 540,
    rating: 5,
  },
  {
    title: "دوره متوسط B1",
    slug: "course-b1",
    level: "B1",
    badge: "محبوب",
    colorTheme: "orange",
    shortDescription: "آماده برای ارتباط مستقل",
    description:
      "آمادگی کامل برای ارتباط مستقل، آزمون‌های رسمی Goethe / Telc و مهاجرت کاری و تحصیلی به آلمان.",
    features: ["مکالمه روان", "نوشتن متن‌های ساده", "درک متون پیچیده"],
    syllabus: [
      { title: "فصل ۱: بیان نظر، بحث و استدلال به آلمانی", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۲: گرامر پیشرفته B1 (Passiv, Konjunktiv II)", lessonsCount: 14, durationMinutes: 90 },
      { title: "فصل ۳: نامه‌نگاری رسمی و رزومه‌نویسی", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۴: شبیه‌سازی کامل آزمون B1", lessonsCount: 10, durationMinutes: 90 },
    ],
    duration: "۳ ماه",
    sessionsCount: 48,
    instructor: "امید عفیفی",
    price: 4000000,
    discountPercent: 0,
    isFree: false,
    image: "https://ui-avatars.com/api/?name=B+1&background=EA580C&color=fff&size=128",
    studentsCount: 590,
    rating: 5,
  },
  {
    title: "دوره پیشرفته B2",
    slug: "course-b2",
    level: "B2",
    badge: "پیشرفته",
    colorTheme: "purple",
    shortDescription: "مسلط به زبان آلمانی",
    description:
      "تسلط حرفه‌ای بر زبان آلمانی با تمرکز ویژه بر محیط‌های کاری، فناوری اطلاعات، ارائه و مصاحبه‌های تخصصی.",
    features: ["تسلط کامل بر گرامر", "ارائه و سخنرانی", "نوشتن حرفه‌ای"],
    syllabus: [
      { title: "فصل ۱: زبان تخصصی فناوری و محیط کار آلمانی", lessonsCount: 14, durationMinutes: 90 },
      { title: "فصل ۲: ساختارهای پیچیده گرامری و نگارش آکادمیک", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۳: تکنیک‌های ارائه (Präsentation) و مصاحبه شغلی", lessonsCount: 12, durationMinutes: 90 },
      { title: "فصل ۴: آمادگی آزمون Goethe B2 و TestDaF", lessonsCount: 10, durationMinutes: 90 },
    ],
    duration: "۳ ماه",
    sessionsCount: 48,
    instructor: "امید عفیفی",
    price: 5500000,
    discountPercent: 0,
    isFree: false,
    image: "https://ui-avatars.com/api/?name=B+2&background=9333EA&color=fff&size=128",
    studentsCount: 310,
    rating: 5,
  },
];

const coupons = [
  {
    code: "SUMMER20",
    description: "تخفیف ویژه تابستان — ۲۰٪ تخفیف ثبت‌نام دوره‌ها",
    discountPercent: 20,
    maxDiscount: 2000000,
    minOrderAmount: 0,
    usageLimit: 500,
    isActive: true,
  },
  {
    code: "WELCOME10",
    description: "کد خوش‌آمدگویی دانشجویان جدید — ۱۰٪ تخفیف",
    discountPercent: 10,
    maxDiscount: 1000000,
    minOrderAmount: 0,
    usageLimit: 1000,
    isActive: true,
  },
];

const posts = [
  {
    title: "مکالمه زبان آلمانی — تمرینات روزمره",
    slug: "german-conversation-daily-practice",
    category: "education",
    tag: "آموزش",
    excerpt:
      "روش‌های ساده و کاربردی برای تقویت مهارت مکالمه آلمانی در محیط‌های واقعی و کاری.",
    content:
      "تقویت مکالمه زبان آلمانی نیازمند تمرین روزانه، تکنیک Shadowing و استفاده از جملات کاربردی در موقعیت‌های واقعی است. در این راهنما با ۱۵ دقیقه تمرین روزانه آشنا می‌شوید.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    persianDate: "20 اسفند 1402",
    views: 245,
    isFeatured: true,
  },
  {
    title: "نکات کلیدی گرامر آلمانی",
    slug: "german-grammar-key-tips",
    category: "education",
    tag: "گرامر",
    excerpt:
      "آشنایی با مهم‌ترین قواعد گرامر زبان آلمانی که برای تسلط بر این زبان ضروری هستند.",
    content:
      "درک دقیق آرتیکل‌ها (der, die, das)، حالت‌های اسمی (Nominativ, Akkusativ, Dativ, Genitiv) و جایگاه فعل در جمله ستون اصلی گرامر آلمانی است.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    persianDate: "15 اسفند 1402",
    views: 189,
    isFeatured: true,
  },
  {
    title: "واژگان تخصصی فناوری به آلمانی",
    slug: "german-tech-vocabulary",
    category: "education",
    tag: "واژگان",
    excerpt:
      "فهرست کامل واژگان و اصطلاحات رایج در حوزه فناوری اطلاعات و کامپیوتر به زبان آلمانی.",
    content:
      "برای کار در شرکت‌های فناوری آلمان، آشنایی با اصطلاحاتی مانند die Schnittstelle (رابط)، die Datenbank (پایگاه داده) و die Entwicklung (توسعه) بسیار کمک‌کننده است.",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    persianDate: "10 اسفند 1402",
    views: 312,
  },
  {
    title: "تفاوت آزمون‌های Goethe و TestDaF",
    slug: "goethe-vs-testdaf",
    category: "articles",
    tag: "آزمون",
    excerpt:
      "کدام آزمون برای شما مناسب‌تر است؟ مقایسه ساختار، سطح دشواری و اعتبار هر یک در کشور آلمان.",
    content:
      "آزمون گوته از سطح A1 تا C2 برگزار می‌شود و برای مهاجرت کاری و ویزا بسیار محبوب است؛ در حالی که TestDaF بیشتر ویژه پذیرش در دانشگاه‌های آلمان طراحی شده است.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    persianDate: "15 اسفند 1402",
    views: 420,
    isFeatured: true,
  },
  {
    title: "چگونه در ۶ ماه آلمانی یاد بگیریم؟",
    slug: "learn-german-in-6-months",
    category: "articles",
    tag: "مهارت",
    excerpt:
      "استراتژی‌های عملی و برنامه‌ریزی دقیق برای رسیدن به سطح مناسب در زبان آلمانی در کوتاه‌ترین زمان ممکن.",
    content:
      "با اختصاص روزانه ۲ ساعت مطالعه ساختاریافته، ترکیب پادکست، فلش‌کارت‌های تکرار با فاصله و کلاس مکالمه می‌توانید طی ۶ ماه به سطح B1 برسید.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    persianDate: "20 اسفند 1402",
    views: 365,
  },
  {
    title: "۱۰ نکته درباره آداب معاشرت در آلمان",
    slug: "german-etiquette-10-tips",
    category: "culture",
    tag: "فرهنگ",
    excerpt:
      "آلمانی‌ها به وقت‌شناسی و صراحت شهرت دارند. در این مقاله با جزییات رفتاری که باید در آلمان رعایت کنید آشنا می‌شوید.",
    content:
      "وقت‌شناسی (Pünktlichkeit)، احترام به حریم شخصی، تفکیک زباله و استفاده درست از Sie و du از مهم‌ترین اصول زندگی و کار در آلمان هستند.",
    image: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800",
    persianDate: "20 اسفند 1402",
    views: 280,
    isFeatured: true,
  },
  {
    title: "آشنایی با جشن اکتبرفست (Oktoberfest)",
    slug: "oktoberfest-germany",
    category: "culture",
    tag: "جشن",
    excerpt:
      "بزرگترین جشن مردمی جهان که هر سال در مونیخ برگزار می‌شود. تاریخچه و جذابیت‌های این جشن رنگارنگ.",
    content:
      "جشن اکتبرفست از سال ۱۸۱۰ در شهر مونیخ آغاز شد و امروزه یکی از شناخته‌شده‌ترین رویدادهای فرهنگی آلمان در سراسر دنیاست.",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
    persianDate: "15 اسفند 1402",
    views: 195,
  },
  {
    title: "آغاز ثبت‌نام دوره‌های ترم جدید",
    slug: "new-term-registration-open",
    category: "news",
    tag: "مهم",
    excerpt:
      "ثبت‌نام ترم جدید آغاز شد. ظرفیت دوره‌های فشرده محدود است و امکان استفاده از کد تخفیف SUMMER20 فراهم است.",
    content:
      "ثبت‌نام دوره‌های آنلاین A1 تا B2 برای ترم جدید آغاز شده است. کلاس‌ها به صورت تعاملی همراه با دسترسی ۲۴/۷ به ویدیوهای ضبط‌شده برگزار می‌شوند.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
    persianDate: "20 اسفند 1402",
    views: 510,
  },
];

const resources = [
  {
    title: "کتاب‌های Menschen",
    slug: "menschen-books",
    description:
      "یکی از محبوب‌ترین متدهای آموزشی برای سطوح A1 تا B1. شامل فایل‌های صوتی و کتاب کار.",
    type: "book",
    level: "A1",
    url: "https://www.hueber.de/menschen",
    icon: "fas fa-book",
    color: "blue",
  },
  {
    title: "وب‌سایت Deutsche Welle",
    slug: "deutsche-welle",
    description:
      "منبعی فوق‌العاده برای یادگیری خودآموز با ویدیوها و تمرینات تعاملی رایگان (مجموعه Nicos Weg).",
    type: "website",
    level: "ALL",
    url: "https://learngerman.dw.com",
    icon: "fas fa-globe",
    color: "green",
  },
  {
    title: "پادکست Easy German",
    slug: "easy-german-podcast",
    description:
      "پادکست و ویدیوهای روزمره با زبان واقعی خیابانی و کاری آلمان همراه با زیرنویس.",
    type: "audio",
    level: "B1",
    url: "https://www.easygerman.org",
    icon: "fas fa-headphones",
    color: "orange",
  },
];

const testimonials = [
  {
    name: "علی رضایی",
    courseLevel: "دانشجوی دوره B1",
    rating: 5,
    comment:
      "بهترین دوره‌ای که تا به حال شرکت کردم. محتوای عالی و آموزش دقیق. الان می‌تونم به راحتی به آلمانی صحبت کنم.",
    avatar: "https://ui-avatars.com/api/?name=Ali+Rezaei&background=DD0000&color=fff&size=60",
    isApproved: true,
  },
  {
    name: "سارا محمدی",
    courseLevel: "دانشجوی دوره A2",
    rating: 5,
    comment:
      "پلتفرم فوق‌العاده‌ای دارن. می‌تونم هر زمان که خواستم به ویدیوها دسترسی داشته باشم و تمرین کنم.",
    avatar: "https://ui-avatars.com/api/?name=Sara+Mohammadi&background=FFCE00&color=000&size=60",
    isApproved: true,
  },
  {
    name: "رضا کریمی",
    courseLevel: "دانشجوی دوره B2",
    rating: 5,
    comment:
      "تمرکز روی زبان تخصصی فناوری خیلی به من کمک کرد. الان می‌تونم در شرکت آلمانی کار کنم.",
    avatar: "https://ui-avatars.com/api/?name=Reza+Karimi&background=000000&color=fff&size=60",
    isApproved: true,
  },
];

const faqs = [
  {
    question: "مدت زمان هر دوره چقدر است؟",
    answer:
      "هر دوره به طور متوسط ۳ ماه طول می‌کشد و شامل ۴۸ جلسه آموزشی است که هر جلسه ۹۰ دقیقه می‌باشد.",
    page: "home",
    order: 1,
  },
  {
    question: "آیا می‌توانم بعد از ثبت‌نام وقت کلاس را تغییر دهم؟",
    answer:
      "بله، شما می‌توانید تا ۴۸ ساعت قبل از شروع کلاس، زمان خود را تغییر دهید یا به کلاس‌های ضبط شده دسترسی داشته باشید.",
    page: "home",
    order: 2,
  },
  {
    question: "چه پیش‌نیازی برای شروع دوره A1 لازم است؟",
    answer:
      "هیچ پیش‌نیازی لازم نیست. دوره A1 از صفر شروع می‌شود و برای کسانی که هیچ آشنایی با زبان آلمانی ندارند مناسب است.",
    page: "home",
    order: 3,
  },
  {
    question: "آیا برای خرید دوره‌ها باید در سایت ثبت‌نام کنم؟",
    answer:
      "خرید به صورت مهمان هم امکان‌پذیر است، اما با ثبت‌نام در سایت می‌توانید تاریخچه سفارش‌ها و دسترسی به دوره‌ها را در پنل کاربری خود مدیریت کنید.",
    page: "contact",
    order: 4,
  },
  {
    question: "نحوه پرداخت هزینه دوره‌ها چگونه است؟",
    answer:
      "پرداخت هم از طریق درگاه آنلاین و هم به صورت کارت به کارت در صفحه تکمیل سفارش امکان‌پذیر است.",
    page: "contact",
    order: 5,
  },
];

const notifications = [
  {
    user: null,
    title: "تخفیف ویژه تابستان ۲۰٪",
    message: "با کد تخفیف SUMMER20 می‌توانید با ۲۰٪ تخفیف در تمام دوره‌ها ثبت‌نام کنید.",
    type: "promo",
    icon: "fas fa-gift",
    link: "index.html#courses",
  },
  {
    user: null,
    title: "شروع ثبت‌نام ترم جدید",
    message: "ظرفیت دوره‌های A1 تا B2 برای ترم جدید باز شد.",
    type: "course",
    icon: "fas fa-graduation-cap",
    link: "category-courses.html",
  },
];

const run = async () => {
  try {
    await mongoose.connect(env.mongoUri);

    if (process.argv.includes("-d")) {
      await Promise.all([
        Course.deleteMany({}),
        Coupon.deleteMany({}),
        Post.deleteMany({}),
        Resource.deleteMany({}),
        Testimonial.deleteMany({}),
        Faq.deleteMany({}),
        Notification.deleteMany({ user: null }),
      ]);
      console.log("All seeded data deleted.");
      process.exit(0);
    }

    // Upsert default admin user
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@techdeutschpro.com").toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || "امید عفیفی",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || "09394962091",
        password: process.env.ADMIN_PASSWORD || "Admin1234!",
        role: "admin",
      });
      console.log(`Admin created: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }

    await Promise.all([
      Course.deleteMany({}),
      Coupon.deleteMany({}),
      Post.deleteMany({}),
      Resource.deleteMany({}),
      Testimonial.deleteMany({}),
      Faq.deleteMany({}),
      Notification.deleteMany({ user: null }),
    ]);

    const [
      createdCourses,
      createdCoupons,
      createdPosts,
      createdResources,
      createdTestimonials,
      createdFaqs,
      createdNotifications,
    ] = await Promise.all([
      Course.insertMany(courses),
      Coupon.insertMany(coupons),
      Post.insertMany(posts),
      Resource.insertMany(resources),
      Testimonial.insertMany(testimonials),
      Faq.insertMany(faqs),
      Notification.insertMany(notifications),
    ]);

    console.log("Seed complete:");
    console.log(`  Courses:       ${createdCourses.length}`);
    console.log(`  Coupons:       ${createdCoupons.length} (SUMMER20, WELCOME10)`);
    console.log(`  Posts:         ${createdPosts.length}`);
    console.log(`  Resources:     ${createdResources.length}`);
    console.log(`  Testimonials:  ${createdTestimonials.length}`);
    console.log(`  FAQs:          ${createdFaqs.length}`);
    console.log(`  Notifications: ${createdNotifications.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seeder error:", error.message);
    process.exit(1);
  }
};

run();
