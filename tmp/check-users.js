const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/MewangiWebsite/backend/.env' });
const User = require('./backend/models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      console.log('Admin users found:');
      admins.forEach(admin => {
        console.log(`Username: ${admin.username}, Email: ${admin.email}`);
      });
    } else {
      console.log('No admin users found.');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
