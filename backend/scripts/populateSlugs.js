const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const slugify = require('slugify');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Article = require('../models/Article');
const ForumTopic = require('../models/ForumTopic');
const Review = require('../models/Review');
const Perfume = require('../models/Perfume');

const MONGODB_URI = process.env.MONGODB_URI;

async function populateSlugs() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    // 1. Articles
    const articles = await Article.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    console.log(`Found ${articles.length} articles without slugs.`);
    for (const doc of articles) {
      doc.slug = slugify(doc.title, { lower: true, strict: true });
      await doc.save();
    }

    // 2. Forum Topics
    const topics = await ForumTopic.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    console.log(`Found ${topics.length} forum topics without slugs.`);
    for (const doc of topics) {
      doc.slug = slugify(doc.title, { lower: true, strict: true });
      await doc.save();
    }

    // 3. Reviews
    const reviews = await Review.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    console.log(`Found ${reviews.length} reviews without slugs.`);
    for (const doc of reviews) {
      if (doc.title) {
        doc.slug = slugify(doc.title, { lower: true, strict: true });
        await doc.save();
      }
    }

    // 4. Perfumes
    const perfumes = await Perfume.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    console.log(`Found ${perfumes.length} perfumes without slugs.`);
    for (const doc of perfumes) {
      doc.slug = slugify(doc.name, { lower: true, strict: true });
      await doc.save();
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

populateSlugs();
