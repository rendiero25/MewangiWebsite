const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul artikel wajib diisi'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: [true, 'Konten artikel wajib diisi'],
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [300, 'Excerpt maksimal 300 karakter'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Tips & Trik', 'Edukasi', 'Berita', 'Interview', 'Event', 'Lainnya'],
    default: 'Lainnya',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft',
  },
  hasBeenApproved: {
    type: Boolean,
    default: false,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  views: {
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

// Auto-generate slug from title
articleSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    // Append timestamp to ensure uniqueness
    this.slug += '-' + Date.now().toString(36);
  }
});

articleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', articleSchema);
