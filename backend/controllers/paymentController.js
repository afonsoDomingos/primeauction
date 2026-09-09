const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const axios = require('axios');
const crypto = require('crypto');

// Helper to fulfill participation fee and optional initial bid upon successful payment
const fulfillSuccessfulPayment = async (payment, io) => {
  try {
    const auction = await Auction.findById(payment.auction);
    if (!auction) return;

    const userId = payment.user?._id || payment.user;

    // 1. Add user to auction participants if not already added
    if (!auction.participants) auction.participants = [];
    const alreadyParticipant = auction.participants.some(
      p => p.user && p.user.toString() === userId.toString()
    );

    if (!alreadyParticipant) {
      auction.participants.push({
        user: userId,
        payment: payment._id,
        paidAt: payment.completedAt || new Date()
      });
      await auction.save();
    }

    // 2. If an initial bid was proposed and auction is still active, register it!
    if (payment.initialBidAmount && auction.status === 'active' && !auction.isEnded) {
      if (payment.initialBidAmount > auction.currentPrice) {
        const bid = await Bid.create({
          auction: auction._id,
          user: userId,
          amount: payment.initialBidAmount
        });

        auction.currentPrice = payment.initialBidAmount;
        await auction.save();
        await bid.populate({ path: 'user', select: 'name profilePhoto' });

        if (io) {
          io.to(auction._id.toString()).emit('new_bid', {
            auctionId: auction._id.toString(),
            currentPrice: payment.initialBidAmount,
            bid,
            endTime: auction.endTime,
            wasExtended: false,
            extendedMinutes: 3
          });
        }
      }
    }

    // 3. Emit real-time participation confirmed event to the user
    if (io) {
      io.to(`user_${userId}`).emit('participation_confirmed', {
        auctionId: auction._id.toString(),
        paymentId: payment._id,
        amount: payment.amount,
        status: 'completed'
      });
    }
  } catch (err) {
    console.error('Error fulfilling successful payment:', err);
  }
};

// Helper to generate unique M-Pesa Transaction ID (Vodacom Mozambique format)
const generateMpesaTxId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `MP${dateStr}.${randomChars}`;
};

// Helper to format phone number
const formatMpesaPhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('258')) {
    cleaned = cleaned.substring(3);
  }
  return cleaned;
};

// Encrypt API Key using RSA Public Key (Vodacom Mozambique Standard)
const getMpesaBearerToken = (apiKey, publicKeyPem) => {
  if (!publicKeyPem) return apiKey;
  try {
    const formattedKey = publicKeyPem.replace(/\\n/g, '\n');
    const buffer = Buffer.from(apiKey, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: formattedKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    return encrypted.toString('base64');
  } catch (err) {
    console.error('RSA Token Encryption Notice:', err.message);
    return apiKey;
  }
};

// Vodacom M-Pesa C2B API Integration Helper
const callVodacomMpesaApi = async ({ phoneNumber, amount, reference }) => {
  const apiKey = process.env.MPESA_API_KEY || 'k5pn7gsxqncpl4hz0200twavasp5b3tw';
  const publicKey = process.env.MPESA_PUBLIC_KEY;
  const c2bUrl = process.env.MPESA_C2B_URL || 'https://api.sandbox.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/';
  const shortcode = process.env.MPESA_SERVICE_PROVIDER_CODE || '171717';
  const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://primeauction.onrender.com/api/payments/mpesa/callback';
  const formattedMSISDN = '258' + phoneNumber.replace(/\D/g, '').slice(-9);

  const bearerToken = getMpesaBearerToken(apiKey, publicKey);

  try {
    const vodacomRes = await axios.post(
      c2bUrl,
      {
        input_TransactionReference: reference.replace('-', ''),
        input_CustomerMSISDN: formattedMSISDN,
        input_Amount: String(amount),
        input_ThirdPartyReference: reference.replace('-', ''),
        input_ServiceProviderCode: shortcode,
        input_ThirdPartyCallbackURL: callbackUrl
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'developer.mpesa.vm.co.mz',
          'Authorization': `Bearer ${bearerToken}`
        },
        timeout: 8000
      }
    );
    return vodacomRes.data;
  } catch (err) {
    console.log('Vodacom M-Pesa Sandbox API Response/Notice:', err.response?.data || err.message);
    return err.response?.data || null;
  }
};

// @desc    Initiate M-Pesa STK Push Payment (Sandbox)
// @route   POST /api/payments/mpesa/initiate
// @access  Private
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { auctionId, phoneNumber, initialBidAmount, type } = req.body;
    let amount = req.body.amount;

    if (!auctionId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça o ID do leilão e número de telefone M-Pesa.'
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Leilão não encontrado.'
      });
    }

    const paymentType = type || 'participation_fee';
    if (!amount || amount <= 0) {
      amount = auction.participationFee !== undefined && auction.participationFee !== null 
        ? auction.participationFee 
        : 1000;
    }

    const cleanedPhone = formatMpesaPhone(phoneNumber);
    if (!/^(84|85)\d{7}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Número M-Pesa inválido. Insira um número Vodacom válido em Moçambique (ex: 84XXXXXXX ou 85XXXXXXX).'
      });
    }

    const mpesaTransactionId = generateMpesaTxId();
    const reference = `PA-${auctionId.substring(auctionId.length - 6).toUpperCase()}`;

    // Attempt real Vodacom M-Pesa Sandbox API dispatch
    const apiResult = await callVodacomMpesaApi({
      phoneNumber: cleanedPhone,
      amount,
      reference
    });

    const payment = await Payment.create({
      user: req.user.id,
      auction: auction._id,
      amount: Number(amount),
      phoneNumber: `+258 ${cleanedPhone.substring(0, 2)} ${cleanedPhone.substring(2, 5)} ${cleanedPhone.substring(5)}`,
      mpesaTransactionId,
      reference,
      status: 'pending',
      type: paymentType,
      initialBidAmount: initialBidAmount ? Number(initialBidAmount) : null
    });

    res.status(200).json({
      success: true,
      message: 'Solicitação M-Pesa STK Push enviada com sucesso.',
      data: {
        paymentId: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        phoneNumber: payment.phoneNumber,
        mpesaTransactionId: payment.mpesaTransactionId,
        status: payment.status,
        type: payment.type,
        initialBidAmount: payment.initialBidAmount,
        vodacomResponse: apiResult || { ResponseCode: 'INS-0', ResponseDesc: 'Sandbox Test Mode Active' },
        promptMessage: `Prime Auction: Confirmar pagamento da taxa de participação de ${payment.amount.toLocaleString('pt-MZ')} MZN para o leilão "${auction.title}"?`
      }
    });
  } catch (err) {
    console.error('Error initiating M-Pesa payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Confirm M-Pesa Payment with PIN (Sandbox SIMULATION)
// @route   POST /api/payments/mpesa/confirm
// @access  Private
exports.confirmMpesaPayment = async (req, res) => {
  try {
    const { paymentId, pin } = req.body;

    if (!paymentId || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça o ID do pagamento e o PIN de confirmação M-Pesa.'
      });
    }

    if (!/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        success: false,
        error: 'O PIN M-Pesa deve ser composto por exatamente 4 dígitos.'
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate('auction', 'title imageUrl currentPrice category')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Pagamento não encontrado.'
      });
    }

    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Não tem permissão para confirmar este pagamento.'
      });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Este pagamento já foi concluído anteriormente.'
      });
    }

    // Simulate PIN verification & update status
    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();

    // Fulfill participation fee registration & initial bid placement
    await fulfillSuccessfulPayment(payment, req.io);

    // Create real payment notification
    try {
      const { createNotification } = require('./notificationController');
      await createNotification({
        userId: payment.user._id,
        title: 'Pagamento Confirmado',
        message: payment.type === 'participation_fee'
          ? `Taxa de participação de ${payment.amount.toLocaleString('pt-MZ')} MZN confirmada com sucesso! Agora pode licitar livremente no leilão. 🔨`
          : `Pagamento M-Pesa de ${payment.amount.toLocaleString('pt-MZ')} MZN recebido e confirmado com sucesso! 🏦`,
        type: 'payment',
        link: `/auction/${payment.auction?._id || payment.auction}`
      });
    } catch (notifErr) {
      console.error('Error creating payment notification:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Pagamento M-Pesa confirmado com sucesso! ✓',
      data: {
        receipt: {
          receiptNumber: payment._id,
          mpesaTransactionId: payment.mpesaTransactionId,
          reference: payment.reference,
          amount: payment.amount,
          phoneNumber: payment.phoneNumber,
          status: 'COMPLETADO',
          auctionTitle: payment.auction?.title || 'Leilão Prime',
          userName: payment.user?.name,
          date: payment.completedAt,
          paymentMethod: 'Vodacom M-Pesa (C2B Direct Push)'
        }
      }
    });
  } catch (err) {
    console.error('Error confirming M-Pesa payment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user payments history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('auction', 'title imageUrl currentPrice')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single payment receipt
// @route   GET /api/payments/receipt/:id
// @access  Private
exports.getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('auction', 'title imageUrl category currentPrice')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Comprovativo não encontrado.' });
    }

    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acesso negado ao comprovativo.' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all payments for admin
// @route   GET /api/payments/all
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('auction', 'title imageUrl currentPrice')
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Vodacom M-Pesa Webhook Callback Receiver
// @route   POST /api/payments/mpesa/callback
// @access  Public (Vodacom Servers)
exports.handleMpesaCallback = async (req, res) => {
  try {
    const { input_ResultCode, input_ThirdPartyReference, input_TransactionID } = req.body;
    console.log('Vodacom M-Pesa IPG Callback Event Received:', req.body);

    if (input_ResultCode === 'INS-0' || input_ResultCode === '0') {
      const payment = await Payment.findOne({ reference: input_ThirdPartyReference });
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        if (input_TransactionID) {
          payment.mpesaTransactionId = input_TransactionID;
        }
        payment.completedAt = new Date();
        await payment.save();

        // Fulfill participation fee registration & initial bid placement
        await fulfillSuccessfulPayment(payment, req.io);

        // Emit real-time confirmation to user socket room
        if (req.io) {
          req.io.to(`user_${payment.user}`).emit('payment_confirmed', {
            paymentId: payment._id,
            reference: payment.reference,
            amount: payment.amount,
            status: 'completed'
          });
        }
      }
    } else {
      // Payment failed or cancelled by user on mobile phone
      const payment = await Payment.findOne({ reference: input_ThirdPartyReference });
      if (payment && payment.status === 'pending') {
        payment.status = 'failed';
        await payment.save();

        if (req.io) {
          req.io.to(`user_${payment.user}`).emit('payment_failed', {
            paymentId: payment._id,
            reference: payment.reference,
            reason: 'Transação cancelada ou recusada no telemóvel.'
          });
        }
      }
    }

    res.status(200).json({ ResultCode: 'INS-0', ResultDesc: 'Callback processed successfully' });
  } catch (err) {
    console.error('Error in M-Pesa Callback:', err);
    res.status(200).json({ ResultCode: 'INS-1', ResultDesc: 'Callback processing failed' });
  }
};

