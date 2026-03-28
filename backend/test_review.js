const mongoose = require('mongoose');
require('dotenv').config();
const Review = require('./models/Review');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Test creation without images
    const review = await Review.create({
      title: 'Test Review ' + Date.now(),
      content: 'Contoh konten review.',
      author: new mongoose.Types.ObjectId(),
      rating: {
        longevity: 5,
        sillage: 4,
        valueForMoney: 5,
        overall: 5,
      },
      occasion: ['Kantor'],
      season: ['Panas'],
    });
    console.log('Review created successfully:', review._id);
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await mongoose.connection.close();
  }
};

test();
