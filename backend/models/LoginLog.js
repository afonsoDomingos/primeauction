const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Navegador Web'
  },
  deviceType: {
    type: String,
    default: 'Desktop'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked_attempt'],
    default: 'success'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);
