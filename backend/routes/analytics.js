const express = require('express');
const router = express.Router();
const {
  getOverview,
  getAuctionAnalytics,
  getUserAnalytics,
  getBidAnalytics,
  getProposalAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/overview', protect, authorize('admin'), getOverview);
router.get('/auctions', protect, authorize('admin'), getAuctionAnalytics);
router.get('/users', protect, authorize('admin'), getUserAnalytics);
router.get('/bids', protect, authorize('admin'), getBidAnalytics);
router.get('/proposals', protect, authorize('admin'), getProposalAnalytics);

module.exports = router;
