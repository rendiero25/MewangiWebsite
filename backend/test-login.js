const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const checkLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@mewangi.id';
    const passwordAttempt = 'MewangiAdmin2026'; // The new password User set
    const fallbackAttempt = 'MewangiAdmin2024';
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    console.log('User found:', user.email, 'Role:', user.role);
    console.log('Hashed password in DB:', user.password);

    const isMatchNew = await bcrypt.compare(passwordAttempt, user.password);
    console.log(`Password match with ${passwordAttempt}: ${isMatchNew}`);

    const isMatchOld = await bcrypt.compare(fallbackAttempt, user.password);
    console.log(`Password match with ${fallbackAttempt}: ${isMatchOld}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLogin();
