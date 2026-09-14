const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const { search, status, category, location, make, model, year, yearMax, minPrice, maxPrice, fuelType, transmission, bodyType, condition, conditionLevel, maxMileage } = req.query;
    let queryObj = {};

    // For non-admin users, hide finished auctions by default
    // Admins can see all auctions including finished ones
    const isAdmin = req.user && req.user.role === 'admin';
    
    console.log('[getAuctions] User role:', isAdmin ? 'admin' : (req.user ? 'user' : 'guest'));
    console.log('[getAuctions] Requested status:', status);
    
    if (!isAdmin && !status) {
      // Default: show only active and upcoming auctions for regular users
      queryObj.status = { $in: ['active', 'upcoming'] };
      console.log('[getAuctions] Filtering to active/upcoming for non-admin');
    } else if (status) {
      // If status is explicitly requested, use it
      queryObj.status = status;
      console.log('[getAuctions] Using requested status:', status);
    } else if (isAdmin) {
      // Admins see all statuses by default
      // Don't add status filter
      console.log('[getAuctions] Admin user - showing all auctions');
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

    // Vehicle filters
    if (make) {
      queryObj['vehicleSpecs.make'] = make;
    }
    if (model) {
      queryObj['vehicleSpecs.model'] = model;
    }
    if (year) {
      queryObj['vehicleSpecs.year'] = parseInt(year);
    }
    if (yearMax) {
      queryObj['vehicleSpecs.year'] = { $lte: parseInt(yearMax) };
    }
    if (minPrice) {
      queryObj.startingPrice = { $gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      if (queryObj.startingPrice) {
        queryObj.startingPrice.$lte = parseInt(maxPrice);
      } else {
        queryObj.startingPrice = { $lte: parseInt(maxPrice) };
      }
    }
    if (fuelType) {
      queryObj['vehicleSpecs.fuelType'] = fuelType;
    }
    if (transmission) {
      queryObj['vehicleSpecs.transmission'] = transmission;
    }
    if (bodyType) {
      queryObj['vehicleSpecs.bodyType'] = bodyType;
    }
    if (condition) {
      queryObj['vehicleSpecs.condition'] = condition;
    }
    if (conditionLevel) {
      queryObj['vehicleSpecs.conditionLevel'] = parseInt(conditionLevel);
    }
    if (maxMileage) {
      queryObj['vehicleSpecs.mileage'] = { $lte: parseInt(maxMileage) };
    }

    const auctions = await Auction.find(queryObj).sort('-createdAt').populate('bids');
    console.log('[getAuctions] Found', auctions.length, 'auctions');
    console.log('[getAuctions] Auctions statuses:', auctions.map(a => a.status));
    
    res.status(200).json({ success: true, count: auctions.length, data: auctions });
  } catch (err) {
    console.error('[getAuctions] Error:', err);
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

    // Check if auction is finished and user is not admin
    const isAdmin = req.user && req.user.role === 'admin';
    if (auction.status === 'finished' && !isAdmin) {
      return res.status(404).json({ 
        success: false, 
        error: 'Este leilão já terminou e não está mais disponível.' 
      });
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

    // Handle date formatting from datetime-local input
    if (req.body.startTime) {
      req.body.startTime = new Date(req.body.startTime);
    } else {
      req.body.startTime = new Date();
    }
    
    if (req.body.endTime) {
      req.body.endTime = new Date(req.body.endTime);
    }

    // Validate dates
    if (req.body.endTime <= req.body.startTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'A data de fim deve ser posterior à data de início.' 
      });
    }

    const auction = await Auction.create(req.body);

    res.status(201).json({ success: true, data: auction });
  } catch (err) {
    console.error('[createAuction] Error:', err);
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

    // Handle date formatting from datetime-local input
    if (req.body.startTime) {
      req.body.startTime = new Date(req.body.startTime);
    }
    
    if (req.body.endTime) {
      req.body.endTime = new Date(req.body.endTime);
    }

    // Validate dates if both are provided
    if (req.body.startTime && req.body.endTime) {
      if (new Date(req.body.endTime) <= new Date(req.body.startTime)) {
        return res.status(400).json({ 
          success: false, 
          error: 'A data de fim deve ser posterior à data de início.' 
        });
      }
    }

    auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: auction });
  } catch (err) {
    console.error('[updateAuction] Error:', err);
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

