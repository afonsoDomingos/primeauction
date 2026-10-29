const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Informe o valor a levantar'],
    min: [1, 'O valor mínimo de levantamento é 1 MZN']
  },
  method: {
    type: String,
    enum: ['mpesa', 'emola', 'bank'],
    default: 'mpesa'
  },
  destinationAccount: {
    phoneNumber: {
      type: String,
      default: null
    },
    bankName: {
      type: String,
      default: null
    },
    accountNumber: {
      type: String,
      default: null
    },
    holderName: {
      type: String,
      default: null
    },
    ibanOrNuit: {
      type: String,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  adminNotes: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

withdrawalRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
