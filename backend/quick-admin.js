const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define schema directly in script to avoid model resolution issues
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('UserQuick', userSchema);

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const email = 'admin@mewangi.id';
    const existing = await User.findOne({ email });
    
    if (existing) {
      console.log('User already exists. Updating to admin...');
      existing.role = 'admin';
      existing.isVerified = true;
      await existing.save();
      console.log('Updated!');
    } else {
      console.log('Creating new admin...');
      const admin = new User({
        username: 'admin',
        email: email,
        password: 'MewangiAdmin2026',
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin created!');
    }
  } catch (error) {
    console.error('FATAL ERROR:', error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

createAdmin();
