const Auction = require('../models/Auction');

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
    const auction = await Auction.findById(req.params.id).populate({
      path: 'createdBy winner',
      select: 'name email'
    });

    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    res.status(200).json({ success: true, data: auction });
  } catch (err) {
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
