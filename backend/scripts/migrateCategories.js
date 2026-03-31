const mongoose = require('mongoose');
const Category = require('../models/Category');
const ForumTopic = require('../models/ForumTopic');
require('dotenv').config();

const initialCategories = [
  { name: 'Diskusi Umum', description: 'Tempat mengobrol santai seputar parfum', icon: 'HiOutlineChatAlt2', order: 1 },
  { name: 'Rekomendasi', description: 'Cari atau beri saran parfum terbaik', icon: 'HiOutlineLightBulb', order: 2 },
  { name: 'Jual Beli', description: 'Pasar komunitas untuk preloved & decant', icon: 'HiOutlineShoppingBag', order: 3 },
  { name: 'Clone & Inspired', description: 'Diskusi parfum alternatif & dupe', icon: 'HiOutlineDuplicate', order: 4 },
  { name: 'Tips & Trik', description: 'Edukasi cara pakai & simpan parfum', icon: 'HiOutlineAcademicCap', order: 5 },
  { name: 'Lainnya', description: 'Topik lain di luar kategori utama', icon: 'HiOutlineDotsHorizontal', order: 6 },
];

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // 1. Seed Categories if not exist
    for (const cat of initialCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }

    // 2. Fetch all categories back to get IDs
    const categories = await Category.find();
    const catMap = {};
    categories.forEach(c => {
      catMap[c.name] = c._id;
    });

    // 3. Update existing topics
    const topics = await ForumTopic.find();
    let updatedCount = 0;
    
    for (const topic of topics) {
      // Check if topic.category is still a string (or matches a name)
      // This is a bit tricky since we changed the schema type to ObjectID
      // But Mongoose might still return the underlying data if not strictly cast yet,
      // or we can use lean() or find().populate() to check.
      // Actually, if we just find() them, the 'category' field will be whatever is in DB.
      
      if (typeof topic.category === 'string' && catMap[topic.category]) {
        topic.category = catMap[topic.category];
        await topic.save();
        updatedCount++;
      } else if (!topic.category && catMap['Lainnya']) {
        // Fallback for missing categories
        topic.category = catMap['Lainnya'];
        await topic.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} topics.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
