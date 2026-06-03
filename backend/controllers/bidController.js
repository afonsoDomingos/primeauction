const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// @desc    Get bids for an auction
// @route   GET /api/bids/:auctionId
// @access  Public
exports.getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate({ path: 'user', select: 'name' })
      .sort('-amount'); // Highest first

    res.status(200).json({ success: true, count: bids.length, data: bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/mybids
// @access  Private/User
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ user: req.user.id })
      .populate({ path: 'auction', select: 'title imageUrl currentPrice status endTime' })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bids.length, data: bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Place a bid
// @route   POST /api/bids/:auctionId
// @access  Private/User
exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.auctionId;

    // Check if auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    // Check if auction is active
    if (auction.isEnded || auction.status !== 'active') {
      return res.status(400).json({ success: false, error: 'This auction has ended' });
    }

    // Validate bid amount
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ success: false, error: 'Bid must be higher than current price' });
    }

    // Create bid
    const bid = await Bid.create({
      auction: auctionId,
      user: req.user.id,
      amount
    });

    // Update auction current price
    auction.currentPrice = amount;
    await auction.save();

    // Populate user to send to socket
    await bid.populate({ path: 'user', select: 'name' });

    // Emit event to socket room
    req.io.to(auctionId).emit('new_bid', {
      auctionId,
      currentPrice: amount,
      bid
    });

    res.status(201).json({ success: true, data: bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
