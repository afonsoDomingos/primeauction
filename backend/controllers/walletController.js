const User = require('../models/User');
const Auction = require('../models/Auction');
const WalletTransaction = require('../models/WalletTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Generate Unique Transaction Reference
const generateTxReference = (prefix = 'TXN') => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

// 1. Get Wallet Summary
exports.getWalletSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet name email phone');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    const available = user.wallet?.availableBalance || 0;
    const reserved = user.wallet?.reservedBalance || 0;
    const refunded = user.wallet?.totalRefunded || 0;

    // Sum of pending / processing withdrawals
    const pendingWithdrawalsAgg = await WithdrawalRequest.aggregate([
      { $match: { user: user._id, status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingWithdrawals = pendingWithdrawalsAgg[0]?.total || 0;

    // Count active auctions where user has reserved fee
    const activeReservedAuctionsCount = await Auction.countDocuments({
      'participants.user': user._id,
      status: { $in: ['active', 'upcoming'] }
    });

    res.status(200).json({
      success: true,
      data: {
        availableBalance: available,
        reservedBalance: reserved,
        totalRefunded: refunded,
        pendingWithdrawals,
        activeReservedAuctionsCount,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Error in getWalletSummary:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar resumo da carteira' });
  }
};

// 2. Get Paginated Wallet Transactions
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('auction', 'title slug images status currentPrice')
      .populate('relatedPayment', 'paymentMethod mpesaTransactionId');

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar transações' });
  }
};

// 3. Get Digital Receipt for a Transaction
exports.getTransactionReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await WalletTransaction.findById(id)
      .populate('user', 'name email phone province')
      .populate('auction', 'title slug currentPrice participationFee category startTime endTime')
      .populate('relatedPayment')
      .populate('relatedWithdrawal');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transação não encontrada' });
    }

    // Security check: only owner or admin can view receipt
    if (transaction.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão para consultar este comprovativo' });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error in getTransactionReceipt:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar comprovativo digital' });
  }
};

// 4. Pay Participation Fee Using Existing Wallet Balance
exports.payFeeWithWallet = async (req, res) => {
  try {
    const { auctionId } = req.body;
    if (!auctionId) {
      return res.status(400).json({ success: false, message: 'ID do leilão obrigatório' });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Leilão não encontrado' });
    }

    if (auction.status === 'finished' || auction.isEnded) {
      return res.status(400).json({ success: false, message: 'Este leilão já se encontra encerrado' });
    }

    const userId = req.user.id;

    // Check if already registered
    const alreadyRegistered = (auction.participants || []).some(
      p => p.user && p.user.toString() === userId.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'Já está inscrito neste leilão' });
    }

    const fee = auction.participationFee || 0;
    if (fee <= 0) {
      // Free participation: simply register
      auction.participants.push({ user: userId, paidAt: new Date() });
      await auction.save();
      return res.status(200).json({
        success: true,
        message: 'Inscrição gratuita confirmada com sucesso!'
      });
    }

    // Atomic update on user balance: only proceed if availableBalance >= fee
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        'wallet.availableBalance': { $gte: fee }
      },
      {
        $inc: {
          'wallet.availableBalance': -fee,
          'wallet.reservedBalance': fee
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Saldo disponível insuficiente na carteira para pagar esta garantia de inscrição.'
      });
    }

    // Register participant in auction
    auction.participants.push({
      user: userId,
      paidAt: new Date()
    });
    await auction.save();

    // Create WalletTransaction record
    const ref = generateTxReference('GAR');
    const transaction = await WalletTransaction.create({
      user: userId,
      auction: auction._id,
      type: 'fee_deduction',
      amount: fee,
      balanceAfter: {
        available: updatedUser.wallet.availableBalance,
        reserved: updatedUser.wallet.reservedBalance
      },
      status: 'completed',
      isRefundableFee: true,
      description: `Garantia de participação reservada para o leilão: ${auction.title}`,
      reference: ref,
      metadata: {
        paymentMethod: 'Carteira Prime Auction',
        auctionTitle: auction.title,
        refundableNotice: 'Valor reembolsável após o término do leilão conforme regras contratuais'
      }
    });

    // Create notification
    await Notification.create({
      user: userId,
      title: 'Inscrição Confirmada com Saldo',
      message: `A garantia de ${fee.toLocaleString('pt-MZ')} MZN foi reservada da sua carteira para o leilão "${auction.title}". O valor será libertado após o encerramento.`,
      type: 'payment',
      link: `/auction/${auction._id}`
    });

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('participation_confirmed', {
        auctionId: auction._id.toString(),
        transactionId: transaction._id,
        amount: fee,
        status: 'completed',
        source: 'wallet'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Garantia de inscrição reservada com sucesso a partir da sua carteira!',
      data: {
        transaction,
        wallet: updatedUser.wallet
      }
    });
  } catch (error) {
    console.error('Error in payFeeWithWallet:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar reserva com carteira' });
  }
};

// 5. Request Balance Withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, destinationAccount } = req.body;
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valor de levantamento inválido' });
    }

    if (withdrawAmount < 50) {
      return res.status(400).json({ success: false, message: 'O valor mínimo de levantamento é 50 MZN' });
    }

    if (!method || !['mpesa', 'emola', 'bank'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Método de levantamento inválido' });
    }

    // Validate destination fields
    if ((method === 'mpesa' || method === 'emola') && !destinationAccount?.phoneNumber) {
      return res.status(400).json({ success: false, message: 'Número de telefone para levantamento obrigatório' });
    }
    if (method === 'bank' && (!destinationAccount?.bankName || !destinationAccount?.accountNumber)) {
      return res.status(400).json({ success: false, message: 'Nome do banco e número de conta/IBAN são obrigatórios' });
    }

    const userId = req.user.id;

    // Atomically decrement user's available balance to prevent double spending
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        'wallet.availableBalance': { $gte: withdrawAmount }
      },
      {
        $inc: { 'wallet.availableBalance': -withdrawAmount }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Saldo disponível insuficiente para efetuar este pedido de levantamento.'
      });
    }

    const ref = generateTxReference('LEV');

    // Create withdrawal request
    const withdrawal = await WithdrawalRequest.create({
      user: userId,
      amount: withdrawAmount,
      method,
      destinationAccount,
      status: 'pending',
      reference: ref,
      adminNotes: 'Pedido submetido pelo utilizador. Aguarda processamento financeiro.'
    });

    // Create transaction in wallet statement as pending
    const transaction = await WalletTransaction.create({
      user: userId,
      type: 'withdrawal',
      amount: withdrawAmount,
      balanceAfter: {
        available: updatedUser.wallet.availableBalance,
        reserved: updatedUser.wallet.reservedBalance
      },
      status: 'pending',
      description: `Pedido de levantamento (${method.toUpperCase()}) para ${destinationAccount.phoneNumber || destinationAccount.accountNumber}`,
      reference: ref,
      relatedWithdrawal: withdrawal._id,
      metadata: {
        method,
        destination: destinationAccount
      }
    });

    // Create notification
    await Notification.create({
      user: userId,
      title: 'Pedido de Levantamento Registado',
      message: `O seu pedido de levantamento de ${withdrawAmount.toLocaleString('pt-MZ')} MZN via ${method.toUpperCase()} foi recebido e está em processamento administrativo.`,
      type: 'payment',
      link: '/dashboard'
    });

    res.status(201).json({
      success: true,
      message: 'Pedido de levantamento submetido com sucesso! O processamento ocorre em até 24 horas úteis.',
      data: {
        withdrawal,
        transaction,
        wallet: updatedUser.wallet
      }
    });
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Erro ao solicitar levantamento' });
  }
};

// 6. Get User's Withdrawal Requests
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Error in getWithdrawals:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter pedidos de levantamento' });
  }
};

// 7. Cancel Pending Withdrawal (User)
exports.cancelWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await WithdrawalRequest.findOne({
      _id: id,
      user: req.user.id,
      status: 'pending'
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Pedido de levantamento não encontrado ou já se encontra em processamento'
      });
    }

    withdrawal.status = 'cancelled';
    withdrawal.adminNotes = 'Cancelado pelo próprio utilizador.';
    await withdrawal.save();

    // Atomically refund back to availableBalance
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { 'wallet.availableBalance': withdrawal.amount } },
      { new: true }
    );

    // Update related transaction
    await WalletTransaction.findOneAndUpdate(
      { relatedWithdrawal: withdrawal._id },
      {
        status: 'cancelled',
        'balanceAfter.available': updatedUser.wallet.availableBalance,
        description: `Levantamento cancelado pelo utilizador (${withdrawal.amount} MZN devolvidos ao saldo disponível)`
      }
    );

    res.status(200).json({
      success: true,
      message: 'Pedido de levantamento cancelado e saldo restituído com sucesso!',
      data: {
        wallet: updatedUser.wallet
      }
    });
  } catch (error) {
    console.error('Error in cancelWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Erro ao cancelar pedido de levantamento' });
  }
};

// 8. Admin: Get All Withdrawals with Filters
exports.getAdminWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.method) query.method = req.query.method;

    const total = await WithdrawalRequest.countDocuments(query);
    const withdrawals = await WithdrawalRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone province')
      .populate('processedBy', 'name email');

    res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAdminWithdrawals:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar pedidos de levantamento' });
  }
};

// 9. Admin: Process Withdrawal (Approve, Complete, Reject)
exports.processAdminWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['processing', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado de levantamento inválido' });
    }

    const withdrawal = await WithdrawalRequest.findById(id).populate('user');
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Pedido de levantamento não encontrado' });
    }

    if (withdrawal.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Este pedido já foi concluído anteriormente' });
    }

    if (withdrawal.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Este pedido já foi rejeitado anteriormente' });
    }

    withdrawal.status = status;
    withdrawal.processedBy = req.user.id;
    withdrawal.processedAt = new Date();
    if (adminNotes) withdrawal.adminNotes = adminNotes;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;

    await withdrawal.save();

    // If REJECTED: return funds back to user's availableBalance atomically!
    if (status === 'rejected') {
      const updatedUser = await User.findByIdAndUpdate(
        withdrawal.user._id,
        { $inc: { 'wallet.availableBalance': withdrawal.amount } },
        { new: true }
      );

      await WalletTransaction.findOneAndUpdate(
        { relatedWithdrawal: withdrawal._id },
        {
          status: 'rejected',
          'balanceAfter.available': updatedUser ? updatedUser.wallet.availableBalance : 0,
          description: `Levantamento rejeitado: ${rejectionReason || 'Dados de destino inválidos'}. Saldo devolvido.`
        }
      );

      await Notification.create({
        user: withdrawal.user._id,
        title: 'Pedido de Levantamento Rejeitado',
        message: `O seu pedido de ${withdrawal.amount.toLocaleString('pt-MZ')} MZN foi rejeitado: "${rejectionReason || 'Contacte o suporte'}". O saldo foi devolvido à sua carteira.`,
        type: 'payment',
        link: '/dashboard'
      });
    } else if (status === 'completed') {
      // Completed: mark transaction completed
      await WalletTransaction.findOneAndUpdate(
        { relatedWithdrawal: withdrawal._id },
        { status: 'completed' }
      );

      await Notification.create({
        user: withdrawal.user._id,
        title: 'Levantamento Concluído com Sucesso',
        message: `O seu levantamento de ${withdrawal.amount.toLocaleString('pt-MZ')} MZN foi processado e transferido para a sua conta de destino.`,
        type: 'payment',
        link: '/dashboard'
      });
    }

    res.status(200).json({
      success: true,
      message: `Pedido de levantamento atualizado para "${status}".`,
      data: withdrawal
    });
  } catch (error) {
    console.error('Error in processAdminWithdrawal:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar pedido de levantamento' });
  }
};

// 10. Admin: Global Financial Audit Log
exports.getAdminTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;

    const total = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('auction', 'title');

    // Financial KPI Totals
    const totalCirculatingAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: '$wallet.availableBalance' },
          totalReserved: { $sum: '$wallet.reservedBalance' },
          totalRefunded: { $sum: '$wallet.totalRefunded' }
        }
      }
    ]);

    const kpis = totalCirculatingAgg[0] || {
      totalAvailable: 0,
      totalReserved: 0,
      totalRefunded: 0
    };

    res.status(200).json({
      success: true,
      data: transactions,
      kpis,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAdminTransactions:', error);
    res.status(500).json({ success: false, message: 'Erro ao auditar transações' });
  }
};
