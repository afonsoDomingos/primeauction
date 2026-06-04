const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort('-createdAt');
    res.status(200).json({ success: true, count: auctions.length, data: auctions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuction = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    // Resolve winner on-demand if auction has expired but still marked active
    if (Date.now() > new Date(auction.endTime).getTime() && auction.status === 'active') {
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort('-amount')
        .populate({ path: 'user', select: 'name email' });

      const updatePayload = { status: 'finished' };
      if (highestBid) {
        updatePayload.winner = highestBid.user._id;
      }

      // Use atomic update so we don't have race conditions with cron
      auction = await Auction.findByIdAndUpdate(
        auction._id,
        updatePayload,
        { new: true }
      );

      console.log(`[ON-DEMAND] Auction "${auction.title}" resolved as finished. Winner: ${highestBid ? highestBid.user.name : 'No bids'}`);
    }

    await auction.populate({
      path: 'createdBy winner',
      select: 'name email'
    });

    res.status(200).json({ success: true, data: auction });
  } catch (err) {
    console.error('[getAuction] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private/Admin
exports.createAuction = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const auction = await Auction.create(req.body);

    res.status(201).json({ success: true, data: auction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private/Admin
exports.updateAuction = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: auction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private/Admin
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    await auction.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload auction image to Cloudinary
// @route   POST /api/auctions/upload-image
// @access  Private/Admin
exports.uploadAuctionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Por favor envie uma imagem' });
    }
    res.status(200).json({ success: true, imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload multiple auction images to Cloudinary
// @route   POST /api/auctions/upload-images
// @access  Private/Admin
exports.uploadAuctionImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Por favor envie pelo menos uma imagem' });
    }
    const imageUrls = req.files.map(file => file.path);
    res.status(200).json({ success: true, imageUrls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

