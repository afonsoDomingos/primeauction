const express = require('express');
const {
  getWalletSummary,
  getTransactions,
  getTransactionReceipt,
  payFeeWithWallet,
  requestWithdrawal,
  getWithdrawals,
  cancelWithdrawal,
  getAdminWithdrawals,
  processAdminWithdrawal,
  getAdminTransactions
} = require('../controllers/walletController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All wallet routes require authentication
router.use(protect);

// User Wallet Endpoints
router.get('/summary', getWalletSummary);
router.get('/transactions', getTransactions);
router.get('/receipt/:id', getTransactionReceipt);
router.post('/pay-fee', payFeeWithWallet);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/cancel', cancelWithdrawal);

// Admin Financial Management Endpoints
router.get('/admin/withdrawals', authorize('admin'), getAdminWithdrawals);
router.put('/admin/withdrawals/:id/process', authorize('admin'), processAdminWithdrawal);
router.get('/admin/transactions', authorize('admin'), getAdminTransactions);

module.exports = router;
