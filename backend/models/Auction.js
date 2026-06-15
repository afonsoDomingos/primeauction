const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image']
  },
  images: {
    type: [String],
    default: []
  },
  startingPrice: {
    type: Number,
    required: [true, 'Please add a starting price']
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.startingPrice;
    }
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time']
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'finished'],
    default: function() {
      if (this.startTime && new Date(this.startTime) > new Date()) {
        return 'upcoming';
      }
      return 'active';
    }
  },
  winner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    default: 'Outros',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to dynamically update status based on dates
auctionSchema.pre('save', function(next) {
  if (this.status !== 'finished') {
    if (this.startTime && new Date(this.startTime) > new Date()) {
      this.status = 'upcoming';
    } else if (this.endTime && new Date(this.endTime) < new Date()) {
      this.status = 'finished';
    } else {
      this.status = 'active';
    }
  }
  next();
});

// Virtual for checking if ended
auctionSchema.virtual('isEnded').get(function() {
  return Date.now() > this.endTime || this.status === 'finished';
});

// Virtual for bids count and list
auctionSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'auction'
});

module.exports = mongoose.model('Auction', auctionSchema);
