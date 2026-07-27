const express = require('express');
const {
  initiateMpesaPayment,
  confirmMpesaPayment,
  handleMpesaCallback,
  getUserPayments,
  getPaymentReceipt,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public Webhook callback endpoint from Vodacom M-Pesa IPG servers
router.post('/mpesa/callback', handleMpesaCallback);

// Protected user routes below
router.use(protect);

router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/mpesa/confirm', confirmMpesaPayment);
router.get('/my-payments', getUserPayments);
router.get('/receipt/:id', getPaymentReceipt);
router.get('/all', authorize('admin'), getAllPayments);

module.exports = router;
