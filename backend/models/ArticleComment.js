const mongoose = require('mongoose');

const articleCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Komentar wajib diisi'],
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArticleComment',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ArticleComment', articleCommentSchema);
