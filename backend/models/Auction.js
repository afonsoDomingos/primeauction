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
  participationFee: {
    type: Number,
    required: [true, 'Por favor defina a taxa de participação'],
    default: 1000,
    min: 0
  },
  applyTax: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  taxInclusive: {
    type: Boolean,
    default: false
  },
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    payment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payment'
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  },
  likesCount: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: false,
    default: 'Maputo',
    trim: true
  },
  // Car-specific fields for automotive niche
  vehicleSpecs: {
    make: {
      type: String,
      default: null
    },
    model: {
      type: String,
      default: null
    },
    year: {
      type: Number,
      default: null,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    mileage: {
      type: Number,
      default: null
    },
    fuelType: {
      type: String,
      enum: ['Gasolina', 'Diesel', 'Híbrido', 'Elétrico', 'GPL', 'Outro'],
      default: null
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automático', 'CVT', 'DSG', 'Outro'],
      default: null
    },
    color: {
      type: String,
      default: null
    },
    bodyType: {
      type: String,
      enum: ['Sedan', 'Hatchback', 'SUV', 'Coupé', 'Van', 'Pickup', 'Carrinha', 'Motociclo', 'Outro'],
      default: null
    },
    engineSize: {
      type: String,
      default: null
    },
    doors: {
      type: Number,
      enum: [2, 3, 4, 5],
      default: null
    },
    seats: {
      type: Number,
      default: null
    },
    condition: {
      type: String,
      enum: ['Novo', 'Usado', 'Seminovo', 'Para Peças', 'Reformado'],
      default: null
    },
    conditionLevel: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: null,
      description: '1 = Excelente (Novo/Seminovo), 2 = Bom, 3 = Regular, 4 = Para Peças'
    },
    features: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to dynamically update status based on dates (Mongoose 9 middleware)
auctionSchema.pre('save', function() {
  if (this.status === 'active') {
    // If explicitly marked active (e.g. Iniciar Imediatamente), ensure startTime is not in the future
    if (this.startTime && new Date(this.startTime) > new Date()) {
      this.startTime = new Date(Date.now() - 1000);
    }
    if (this.endTime && new Date(this.endTime) < new Date()) {
      this.status = 'finished';
    }
    return;
  }

  if (this.status !== 'finished') {
    if (this.startTime && new Date(this.startTime) > new Date()) {
      this.status = 'upcoming';
    } else if (this.endTime && new Date(this.endTime) < new Date()) {
      this.status = 'finished';
    } else {
      this.status = 'active';
    }
  }
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

// Indexes for fast queries, listings, and cron filters
auctionSchema.index({ status: 1, createdAt: -1 });
auctionSchema.index({ status: 1, startTime: 1 });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ startingPrice: 1 });
auctionSchema.index({ createdAt: -1 });
auctionSchema.index({ 'vehicleSpecs.make': 1, 'vehicleSpecs.model': 1 });

module.exports = mongoose.model('Auction', auctionSchema);
