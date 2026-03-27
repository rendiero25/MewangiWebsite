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
}, {
  timestamps: true,
});

module.exports = mongoose.model('ReviewComment', reviewCommentSchema);
