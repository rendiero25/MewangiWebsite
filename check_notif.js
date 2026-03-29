const mongoose = require('mongoose');
const Notification = require('./backend/models/Notification');
const User = require('./backend/models/User');
const Article = require('./backend/models/Article');
require('dotenv').config();

async function checkNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const total = await Notification.countDocuments();
    console.log('Total Notifications:', total);

    const articleComments = await Notification.find({ type: 'comment_article' }).populate('recipient sender');
    console.log('Article Comment Notifications:', JSON.stringify(articleComments, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkNotifications();
