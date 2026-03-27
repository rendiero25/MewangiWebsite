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
    type: String,
    enum: ['Diskusi Umum', 'Rekomendasi', 'Jual Beli', 'Clone & Inspired', 'Tips & Trik', 'Lainnya'],
    default: 'Diskusi Umum',
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
  lastReplyAt: {
    type: Date,
    default: Date.now,
  },
  replyCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

forumTopicSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
