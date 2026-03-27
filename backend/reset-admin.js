const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const resetAndCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@mewangi.id';
    
    // Delete if exists
    await User.deleteOne({ email });
    await User.deleteOne({ username: 'admin' });
    console.log('Cleaned up existing admin user...');

    // Create new admin
    const admin = new User({
      username: 'admin',
      email: email,
      password: 'MewangiAdmin2026',
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

resetAndCreateAdmin();
