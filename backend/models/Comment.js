const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Auction',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Por favor introduza um comentário'],
    trim: true,
    maxlength: [500, 'O comentário não pode ter mais de 500 caracteres']
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
