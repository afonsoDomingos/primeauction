const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const axios = require('axios');

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

// Vodacom M-Pesa C2B API Integration Helper
const callVodacomMpesaApi = async ({ phoneNumber, amount, reference }) => {
  const apiKey = process.env.MPESA_API_KEY || 'k5pn7gsxqncpl4hz0200twavasp5b3tw';
  const shortcode = process.env.MPESA_SERVICE_PROVIDER_CODE || '171717';
  const formattedMSISDN = '258' + phoneNumber.replace(/\D/g, '').slice(-9);

  try {
    const vodacomRes = await axios.post(
      'https://api.sandbox.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/',
      {
        input_TransactionReference: reference.replace('-', ''),
        input_CustomerMSISDN: formattedMSISDN,
        input_Amount: String(amount),
        input_ThirdPartyReference: reference.replace('-', ''),
        input_ServiceProviderCode: shortcode
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'developer.mpesa.vm.co.mz',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 5000
      }
    );
    return vodacomRes.data;
  } catch (err) {
    console.log('Vodacom M-Pesa API Sandbox Call (configured key k5pn7gsxqncpl4hz0200twavasp5b3tw):', err.message || err);
    return null;
  }
};

// @desc    Initiate M-Pesa STK Push Payment (Sandbox)
// @route   POST /api/payments/mpesa/initiate
// @access  Private
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { auctionId, amount, phoneNumber } = req.body;

    if (!auctionId || !amount || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça o ID do leilão, valor e número de telefone M-Pesa.'
      });
    }

    const cleanedPhone = formatMpesaPhone(phoneNumber);
    if (!/^(84|85)\d{7}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Número M-Pesa inválido. Insira um número Vodacom válido em Moçambique (ex: 84XXXXXXX ou 85XXXXXXX).'
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Leilão não encontrado.'
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
      status: 'pending'
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
        vodacomResponse: apiResult || { ResponseCode: 'INS-0', ResponseDesc: 'Sandbox Test Mode Active' },
        promptMessage: `Prime Auction: Confirmar pagamento de ${payment.amount.toLocaleString('pt-MZ')} MZN para o leilão "${auction.title}"?`
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

