const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Cek apakah admin sudah ada (tadi sudah cek, tapi biaran safety)
    const adminExists = await User.findOne({ email: 'admin@mewangi.id' });
    if (adminExists) {
      console.log('Admin already exists. Role:', adminExists.role);
      adminExists.role = 'admin';
      adminExists.isVerified = true;
      await adminExists.save();
      console.log('User updated to Admin.');
    } else {
      const admin = await User.create({
        username: 'admin',
        email: 'admin@mewangi.id',
        password: 'MewangiAdmin2026', // Ini password sementara
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin user created successfully');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
