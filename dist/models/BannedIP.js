const mongoose = require('mongoose');

const bannedIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    default: 'Spam / Abusive behavior',
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiresAt: {
    type: Date, // If null, permanent
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BannedIP', bannedIPSchema);
