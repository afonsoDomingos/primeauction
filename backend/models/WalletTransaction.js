const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    default: null
  },
  type: {
    type: String,
    enum: [
      'deposit',                // Depósito direto na carteira
      'fee_reservation',        // Garantia de inscrição reservada para um leilão
      'fee_release',            // Caução libertada após encerramento do leilão
      'fee_retention_winner',   // Caução retida/creditada para liquidação do vencedor
      'fee_deduction',          // Pagamento de taxa de leilão debitado do saldo da carteira
      'withdrawal',             // Levantamento de fundos da carteira
      'manual_adjustment'       // Ajuste administrativo
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    available: {
      type: Number,
      required: true
    },
    reserved: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'cancelled'],
    default: 'completed'
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  relatedWithdrawal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WithdrawalRequest',
    default: null
  },
  mpesaTransactionId: {
    type: String,
    default: null
  },
  isRefundableFee: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for rapid history queries
walletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
