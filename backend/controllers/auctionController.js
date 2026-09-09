const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const { search, status, category, location } = req.query;
    let queryObj = {};

    if (status) {
      queryObj.status = status;
    }

    if (category) {
      queryObj.category = category;
    }

    if (location) {
      queryObj.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const auctions = await Auction.find(queryObj).sort('-createdAt').populate('bids');
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

    // Resolve status on-demand if startTime has passed but still marked upcoming
    if (Date.now() >= new Date(auction.startTime).getTime() && auction.status === 'upcoming') {
      auction = await Auction.findByIdAndUpdate(
        auction._id,
        { status: 'active' },
        { new: true }
      );
      console.log(`[ON-DEMAND] Auction "${auction.title}" activated.`);
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
      select: 'name email profilePhoto averageRating ratingsCount'
    });

    // Ensure participationFee fallback
    if (auction.participationFee === undefined || auction.participationFee === null) {
      auction.participationFee = 1000;
    }

    // Check if authenticated user has already paid the participation fee
    let hasPaidFee = false;
    if (req.user) {
      const isParticipant = auction.participants && auction.participants.some(
        p => p.user && p.user.toString() === req.user._id.toString()
      );
      if (isParticipant) {
        hasPaidFee = true;
      } else {
        const paymentExists = await Payment.exists({
          user: req.user._id,
          auction: auction._id,
          status: 'completed'
        });
        hasPaidFee = Boolean(paymentExists);
      }
    }

    const auctionData = auction.toObject ? auction.toObject({ virtuals: true }) : auction;
    auctionData.hasPaidFee = hasPaidFee;

    res.status(200).json({ success: true, data: auctionData });
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
    if (req.body.participationFee !== undefined) {
      req.body.participationFee = Number(req.body.participationFee);
    } else {
      req.body.participationFee = 1000;
    }

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

    if (req.body.participationFee !== undefined) {
      req.body.participationFee = Number(req.body.participationFee);
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

