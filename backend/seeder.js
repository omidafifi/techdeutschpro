// Seed the database with the four courses shown on the site.
// Run with:  npm run seed          (adds courses)
// Run with:  npm run seed -- -d    (deletes all courses)
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/courseModel");

const courses = [
  {
    title: "دوره جامع A1 آلمانی",
    slug: "german-a1",
    level: "A1",
    description: "آموزش آلمانی از صفر ویژه فارسی‌زبانان",
    price: 1500000,
    image: "Foto/IMG_7649.jpg",
  },
  {
    title: "دوره جامع A2 آلمانی",
    slug: "german-a2",
    level: "A2",
    description: "ادامه مسیر یادگیری تا سطح A2",
    price: 1800000,
    image: "Foto/IMG_7649.jpg",
  },
  {
    title: "دوره جامع B1 آلمانی",
    slug: "german-b1",
    level: "B1",
    description: "آمادگی برای آزمون‌های رسمی و مهاجرت",
    price: 2200000,
    image: "Foto/IMG_7649.jpg",
  },
  {
    title: "دوره جامع B2 آلمانی",
    slug: "german-b2",
    level: "B2",
    description: "تسلط پیشرفته برای کار و تحصیل در آلمان",
    price: 2500000,
    image: "Foto/IMG_7649.jpg",
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (process.argv.includes("-d")) {
      await Course.deleteMany({});
      console.log("All courses deleted");
    } else {
      await Course.deleteMany({});
      const created = await Course.insertMany(courses);
      console.log(`${created.length} courses seeded`);
      created.forEach((c) => console.log(`  ${c.level} → ${c._id}`));
    }

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

run();
