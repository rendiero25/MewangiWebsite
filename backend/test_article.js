const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const test = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Import model AFTER connection just in case
    const Article = require('./models/Article');
    console.log('Model loaded');

    const payload = {
      title: 'Test Article ' + new Date().toISOString(),
      content: 'Contoh konten artikel.',
      author: new mongoose.Types.ObjectId(),
      category: 'Berita',
    };
    console.log('Payload created');

    const article = new Article(payload);
    console.log('Instance created');
    
    await article.save();
    console.log('Article saved successfully:', article.slug);
  } catch (err) {
    console.error('Test Failed Details:');
    console.error(err);
    if (err.errors) {
       console.error('Validation Errors:', JSON.stringify(err.errors, null, 2));
    }
  } finally {
    await mongoose.connection.close();
  }
};

test();
