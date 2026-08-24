const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Auction',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Por favor selecione uma classificação de 1 a 5 estrelas'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'O comentário não pode ter mais de 500 caracteres'],
    default: ''
  },
  type: {
    type: String,
    enum: ['seller', 'buyer'],
    required: true
  }
}, {
  timestamps: true
});

// Enforce one review per reviewer per auction
reviewSchema.index({ reviewer: 1, auction: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1 });

module.exports = mongoose.model('Review', reviewSchema);
