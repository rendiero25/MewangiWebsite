const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama parfum wajib diisi'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand wajib diisi'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  topNotes: [{
    type: String,
    trim: true,
  }],
  middleNotes: [{
    type: String,
    trim: true,
  }],
  baseNotes: [{
    type: String,
    trim: true,
  }],
  concentration: {
    type: String,
    enum: ['EDT', 'EDP', 'Parfum', 'Cologne', 'Extrait', 'Other'],
    default: 'EDP',
  },
  year: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Pria', 'Wanita', 'Unisex'],
    default: 'Unisex',
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

perfumeSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Perfume', perfumeSchema);
