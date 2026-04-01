const mongoose = require('mongoose');

const forumTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul topik wajib diisi'],
    trim: true,
    maxlength: [200, 'Judul maksimal 200 karakter'],
  },
  content: {
    type: String,
    required: [true, 'Konten topik wajib diisi'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori wajib diisi'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  prefix: {
    type: String,
    trim: true,
    default: '', // e.g., [SOLVED], [WTS]
  },
  type: {
    type: String,
    enum: ['normal', 'poll', 'question'],
    default: 'normal',
  },
  poll: {
    options: [{
      text: String,
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }],
    expiresAt: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // Require admin approval like articles and reviews
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isAnnouncement: {
    type: Boolean,
    default: false,
  },
  lastReplyAt: {
    type: Date,
    default: Date.now,
  },
  replyCount: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

forumTopicSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
