const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Toggle block status of a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Don't allow blocking yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot block yourself' });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Toggle watchlist item
// @route   POST /api/users/watchlist/:auctionId
// @access  Private
exports.toggleWatchlist = async (req, res) => {
  try {
    const Auction = require('../models/Auction');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const auctionId = req.params.auctionId;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    // Initialize watchlist if it doesn't exist
    if (!user.watchlist) user.watchlist = [];

    const index = user.watchlist.indexOf(auctionId);
    let isAdded = false;

    if (index > -1) {
      user.watchlist.splice(index, 1);
      auction.likesCount = Math.max(0, (auction.likesCount || 0) - 1);
    } else {
      user.watchlist.push(auctionId);
      auction.likesCount = (auction.likesCount || 0) + 1;
      isAdded = true;
    }

    await Promise.all([user.save(), auction.save()]);

    res.status(200).json({ success: true, isAdded, count: auction.likesCount, data: user.watchlist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user's watchlist
// @route   GET /api/users/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'watchlist',
      select: 'title imageUrl currentPrice startingPrice status endTime startTime bids likesCount'
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, count: user.watchlist.length, data: user.watchlist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
