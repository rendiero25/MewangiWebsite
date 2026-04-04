const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String, // 'BAN_USER', 'UNBAN_USER', 'DELETE_TOPIC', 'DELETE_COMMENT', 'RESOLVE_REPORT', 'UPDATE_SETTINGS', 'CREATE_CATEGORY'
    required: true,
  },
  targetType: {
    type: String, // 'User', 'Topic', 'Comment', 'Report', 'Category', 'Settings'
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
