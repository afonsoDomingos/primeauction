const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getAuctionReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/auction/:auctionId', protect, getAuctionReview);

module.exports = router;
