const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  forumName: {
    type: String,
    default: 'Mewangi Forum',
  },
  forumDescription: {
    type: String,
    default: 'Komunitas pecinta parfum Indonesia',
  },
  logo: {
    type: String,
    default: '',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'Mewangi sedang dalam pemeliharaan rutin. Silakan kembali lagi nanti.',
  },
  contactEmail: {
    type: String,
    default: 'admin@mewangi.id',
  },
  registrationEnabled: {
    type: Boolean,
    default: true,
  },
  aboutMissionImage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
