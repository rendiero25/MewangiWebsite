const mongoose = require('mongoose');
require('dotenv').config();
const ForumTopic = require('./models/ForumTopic');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const topic = await ForumTopic.create({
      title: 'Test Topic ' + Date.now(),
      content: 'Contoh konten topik.',
      category: 'Diskusi Umum',
      author: new mongoose.Types.ObjectId(),
    });
    console.log('Topic created successfully:', topic._id);
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await mongoose.connection.close();
  }
};

test();
