const mongoose = require('mongoose');
const User = require('../backend/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function seedAdmin() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node scripts/seedAdmin.js <email> <password>');
    process.exit(1);
  }

  const [email, password] = args;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(`User ${email} found. Updating role to admin...`);
      user.role = 'admin';
      user.isVerified = true;
      await user.save();
      console.log('User promoted to admin successfully!');
    } else {
      console.log(`Creating new admin user: ${email}...`);
      user = await User.create({
        username: email.split('@')[0],
        email,
        password,
        role: 'admin',
        isVerified: true
      });
      console.log('Admin created successfully!');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
