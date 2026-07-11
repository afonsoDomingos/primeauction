const express = require('express');
const { getUsers, toggleBlockUser, toggleWatchlist, getWatchlist } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// Watchlist routes (available to any authenticated user)
router.route('/watchlist')
  .get(getWatchlist);

router.route('/watchlist/:auctionId')
  .post(toggleWatchlist);

// Admin-only routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id/block')
  .put(toggleBlockUser);

module.exports = router;
