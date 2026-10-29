const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');
const crypto = require('crypto');

const generateTxRef = (prefix = 'LIB') => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

/**
 * Automatically releases participation guarantees upon auction finish
 * @param {Object} auction - The finished Auction document
 * @param {ObjectId|null} winnerId - Winner user ID if any
 * @param {Object} io - Socket.io instance
 */
const releaseAuctionGuarantees = async (auction, winnerId, io) => {
  try {
    const fee = Number(auction.participationFee) || 0;
    if (fee <= 0) return; // No fee to release

    const participants = auction.participants || [];
    if (participants.length === 0) return;

    for (const p of participants) {
      const participantUserId = p.user?._id || p.user;
      if (!participantUserId) continue;

      const isWinner = winnerId && winnerId.toString() === participantUserId.toString();

      if (isWinner) {
        // WINNER RULE: Retain guarantee towards settlement / auction clearance
        // Check if already processed to ensure idempotency
        const alreadyProcessedWinner = await WalletTransaction.findOne({
          user: participantUserId,
          auction: auction._id,
          type: 'fee_retention_winner'
        });

        if (!alreadyProcessedWinner) {
          // Decrement reserved balance (transferred to contract clearance)
          const updatedUser = await User.findByIdAndUpdate(
            participantUserId,
            { $inc: { 'wallet.reservedBalance': -fee } },
            { new: true }
          );

          await WalletTransaction.create({
            user: participantUserId,
            auction: auction._id,
            type: 'fee_retention_winner',
            amount: fee,
            balanceAfter: {
              available: updatedUser?.wallet?.availableBalance || 0,
              reserved: updatedUser?.wallet?.reservedBalance || 0
            },
            status: 'completed',
            isRefundableFee: false,
            description: `Caução de participação retida para liquidação do lote arrematado: "${auction.title}"`,
            reference: generateTxRef('RET'),
            metadata: {
              auctionTitle: auction.title,
              notice: 'Valor retido para abatimento/garantia da compra final arrematada'
            }
          });

          await Notification.create({
            user: participantUserId,
            title: '🏆 Parabéns! Venceu o Leilão',
            message: `A sua caução de ${fee.toLocaleString('pt-MZ')} MZN para o leilão "${auction.title}" foi retida e será deduzida da liquidação final do lote.`,
            type: 'bid',
            link: `/auction/${auction._id}`
          });
        }
      } else {
        // NON-WINNER PARTICIPANT: Immediate Release to Available Balance
        // Idempotency check: don't release twice!
        const alreadyReleased = await WalletTransaction.findOne({
          user: participantUserId,
          auction: auction._id,
          type: 'fee_release'
        });

        if (!alreadyReleased) {
          // Atomically move from reservedBalance to availableBalance & add to totalRefunded
          const updatedUser = await User.findByIdAndUpdate(
            participantUserId,
            {
              $inc: {
                'wallet.reservedBalance': -fee,
                'wallet.availableBalance': fee,
                'wallet.totalRefunded': fee
              }
            },
            { new: true }
          );

          const txRef = generateTxRef('LIB');
          const tx = await WalletTransaction.create({
            user: participantUserId,
            auction: auction._id,
            type: 'fee_release',
            amount: fee,
            balanceAfter: {
              available: updatedUser?.wallet?.availableBalance || fee,
              reserved: updatedUser?.wallet?.reservedBalance || 0
            },
            status: 'completed',
            isRefundableFee: true,
            description: `Garantia de participação libertada após encerramento do leilão: "${auction.title}"`,
            reference: txRef,
            metadata: {
              auctionTitle: auction.title,
              refundableNotice: 'Saldo disponível imediatamente para novos lances ou pedido de levantamento bancário / M-Pesa'
            }
          });

          await Notification.create({
            user: participantUserId,
            title: '💰 Garantia de Inscrição Libertada',
            message: `O leilão "${auction.title}" terminou. A sua garantia de ${fee.toLocaleString('pt-MZ')} MZN está agora disponível na sua carteira para novos leilões ou para levantamento.`,
            type: 'payment',
            link: '/dashboard'
          });

          if (io) {
            io.to(`user_${participantUserId}`).emit('wallet_balance_updated', {
              availableBalance: updatedUser?.wallet?.availableBalance || fee,
              reservedBalance: updatedUser?.wallet?.reservedBalance || 0,
              releasedAmount: fee,
              transactionId: tx._id,
              auctionTitle: auction.title
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[FinancialReconciler] Error releasing auction guarantees:', err);
  }
};

module.exports = {
  releaseAuctionGuarantees
};
