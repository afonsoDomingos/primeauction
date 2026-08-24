const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// @desc    Get bids for an auction
// @route   GET /api/bids/:auctionId
// @access  Public
exports.getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate({ path: 'user', select: 'name profilePhoto' })
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

    // Check if user is the creator of the auction
    if (auction.createdBy && auction.createdBy.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: 'Não pode fazer lances no seu próprio leilão.' });
    }

    // Check if auction has started
    if (auction.status === 'upcoming' || (auction.startTime && Date.now() < new Date(auction.startTime).getTime())) {
      return res.status(400).json({ success: false, error: 'Este leilão ainda não começou' });
    }

    // Check if auction is active
    if (auction.isEnded || auction.status !== 'active' || Date.now() > new Date(auction.endTime).getTime()) {
      return res.status(400).json({ success: false, error: 'Este leilão já foi encerrado.' });
    }

    // Validate bid amount
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ 
        success: false, 
        error: `O valor do lance (${amount.toLocaleString('pt-MZ')} MZN) deve ser estritamente superior ao lance atual (${auction.currentPrice.toLocaleString('pt-MZ')} MZN).` 
      });
    }

    // Anti-sniping protection logic:
    // If a bid is placed in the last 3 minutes (180,000 ms), extend auction end time by 3 minutes
    const ANTI_SNIPE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
    const ANTI_SNIPE_EXTENSION_MS = 3 * 60 * 1000; // 3 minutes
    
    const nowMs = Date.now();
    const currentEndTimeMs = new Date(auction.endTime).getTime();
    const timeRemainingMs = currentEndTimeMs - nowMs;
    
    let wasExtended = false;
    if (timeRemainingMs > 0 && timeRemainingMs <= ANTI_SNIPE_THRESHOLD_MS) {
      auction.endTime = new Date(nowMs + ANTI_SNIPE_EXTENSION_MS);
      wasExtended = true;
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
    await bid.populate({ path: 'user', select: 'name profilePhoto' });

    // Emit event to socket room
    req.io.to(auctionId).emit('new_bid', {
      auctionId,
      currentPrice: amount,
      bid,
      endTime: auction.endTime,
      wasExtended,
      extendedMinutes: 3
    });

    // Generate real notifications
    try {
      const { createNotification } = require('./notificationController');
      await createNotification({
        userId: req.user.id,
        title: 'Lance Registado',
        message: `Lance de ${amount.toLocaleString('pt-MZ')} MZN colocado com sucesso no leilão "${auction.title}"! 🔨`,
        type: 'bid',
        link: `/auction/${auctionId}`
      });

      const previousHighest = await Bid.findOne({ auction: auctionId, _id: { $ne: bid._id } }).sort('-amount');
      if (previousHighest && previousHighest.user.toString() !== req.user.id.toString()) {
        await createNotification({
          userId: previousHighest.user,
          title: 'Lance Ultrapassado',
          message: `Alerta: O seu lance no leilão "${auction.title}" foi ultrapassado por outro licitante! ⚠️`,
          type: 'outbid',
          link: `/auction/${auctionId}`
        });
      }
    } catch (notifErr) {
      console.error('Error creating bid notification:', notifErr);
    }

    res.status(201).json({ success: true, data: bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
