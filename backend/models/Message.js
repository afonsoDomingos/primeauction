const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Por favor adicione uma mensagem'],
    maxlength: [1000, 'A mensagem não pode ter mais de 1000 caracteres'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Auction',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
