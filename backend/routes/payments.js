const express = require('express');
const {
  initiateMpesaPayment,
  confirmMpesaPayment,
  getUserPayments,
  getPaymentReceipt,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Protect all routes in this router

router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/mpesa/confirm', confirmMpesaPayment);
router.get('/my-payments', getUserPayments);
router.get('/receipt/:id', getPaymentReceipt);
router.get('/all', authorize('admin'), getAllPayments);

module.exports = router;
