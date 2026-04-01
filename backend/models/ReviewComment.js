const mongoose = require('mongoose');

const reviewCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Komentar wajib diisi'],
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReviewComment',
    default: null,
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReviewComment',
    default: null,
  },
  image: {
    type: String,
    default: '',
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

module.exports = mongoose.model('ReviewComment', reviewCommentSchema);
