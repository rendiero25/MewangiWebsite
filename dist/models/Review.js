const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul review wajib diisi'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Konten review wajib diisi'],
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  perfume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfume',
  },
  rating: {
    longevity: { type: Number, min: 1, max: 5, required: true },
    sillage: { type: Number, min: 1, max: 5, required: true },
    valueForMoney: { type: Number, min: 1, max: 5, required: true },
    overall: { type: Number, min: 1, max: 5, required: true },
  },
  occasion: [{
    type: String,
    enum: ['Sehari-hari', 'Kantor', 'Kencan', 'Pesta', 'Olahraga', 'Formal'],
  }],
  season: [{
    type: String,
    enum: ['Panas', 'Hujan', 'Sejuk', 'Sepanjang Tahun'],
  }],
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending',
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

reviewSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Review', reviewSchema);
