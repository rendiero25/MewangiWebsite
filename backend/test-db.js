const mongoose = require('mongoose');
require('dotenv').config();

const testConn = async () => {
  try {
    console.log('Uri:', process.env.MONGODB_URI.substring(0, 20) + '...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to:', mongoose.connection.name);
    process.exit(0);
  } catch (err) {
    console.error('Conn Error:', err.message);
    process.exit(1);
  }
};

testConn();
