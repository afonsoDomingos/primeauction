const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Please add a key'],
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please add a value']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
