const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const checkData = async () => {
  await connectDB();
  
  const ForumTopic = require('./models/ForumTopic');
  const Article = require('./models/Article');
  const Review = require('./models/Review');

  const topics = await ForumTopic.find({});
  const articles = await Article.find({});
  const reviews = await Review.find({});

  console.log('Forum Topics:', topics.length);
  topics.forEach(t => console.log(`- ${t.title} | Cat: ${t.category} | Status: ${t.status}`));

  console.log('\nArticles:', articles.length);
  articles.forEach(a => console.log(`- ${a.title} | Cat: ${a.category} | Status: ${a.status}`));

  console.log('\nReviews:', reviews.length);
  reviews.forEach(r => console.log(`- ${r.title} | Status: ${r.status}`));

  process.exit();
};

checkData();
