const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Alasan pemberian peringatan wajib diisi'],
  },
  points: {
    type: Number,
    required: true,
    default: 1, // 1 point per warning, or more depending on severity
  },
  expireAt: {
    type: Date, // Warnings can expire after some time (e.g. 6 months)
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'voided'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Warning', warningSchema);
