const mongoose = require('mongoose');
const Article = require('./backend/models/Article');
const User = require('./backend/models/User');
require('dotenv').config();

async function checkArticleAuthor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const articles = await Article.find().populate('author', 'username');
    console.log('Articles and Authors:');
    articles.forEach(a => {
      console.log(`- ${a.title} (Author: ${a.author?.username}, ID: ${a.author?._id})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkArticleAuthor();
