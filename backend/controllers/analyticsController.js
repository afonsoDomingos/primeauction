const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Proposal = require('../models/Proposal');
const Message = require('../models/Message');

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const totalBids = await Bid.countDocuments();
    const totalProposals = await Proposal.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Active auctions
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const upcomingAuctions = await Auction.countDocuments({ status: 'upcoming' });
    const finishedAuctions = await Auction.countDocuments({ status: 'finished' });

    // This month stats
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const newAuctionsThisMonth = await Auction.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const bidsThisMonth = await Bid.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // This week stats
    const bidsThisWeek = await Bid.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Revenue estimation (sum of winning bids from finished auctions)
    const finishedAuctionsWithBids = await Auction.find({
      status: 'finished',
      winner: { $ne: null }
    }).select('_id');

    const auctionIds = finishedAuctionsWithBids.map(a => a._id);
    const winningBids = await Bid.find({
      auction: { $in: auctionIds }
    });

    let totalRevenue = 0;
    for (const auction of finishedAuctionsWithBids) {
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort('-amount');
      if (highestBid) {
        totalRevenue += highestBid.amount;
      }
    }

    // Average bid value
    const avgBidValue = totalBids > 0 
      ? await Bid.aggregate([{ $group: { _id: null, avg: { $avg: '$amount' } } }])
      : [{ avg: 0 }];

    // Top categories
    const categoryStats = await Auction.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // User activity (users with bids in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await Bid.distinct('user', {
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          auctions: totalAuctions,
          bids: totalBids,
          proposals: totalProposals,
          messages: totalMessages
        },
        auctionStatus: {
          active: activeAuctions,
          upcoming: upcomingAuctions,
          finished: finishedAuctions
        },
        thisMonth: {
          newUsers: newUsersThisMonth,
          newAuctions: newAuctionsThisMonth,
          bids: bidsThisMonth
        },
        thisWeek: {
          bids: bidsThisWeek
        },
        revenue: {
          total: totalRevenue,
          averageBid: avgBidValue[0]?.avg || 0
        },
        categories: categoryStats,
        activeUsers: activeUsers.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get auction analytics
// @route   GET /api/analytics/auctions
// @access  Private/Admin
exports.getAuctionAnalytics = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const auctions = await Auction.find({
      createdAt: { $gte: startDate }
    }).select('status category startingPrice currentPrice createdAt endTime');

    const auctionsByStatus = {
      active: auctions.filter(a => a.status === 'active').length,
      upcoming: auctions.filter(a => a.status === 'upcoming').length,
      finished: auctions.filter(a => a.status === 'finished').length
    };

    const auctionsByCategory = {};
    auctions.forEach(auction => {
      auctionsByCategory[auction.category] = (auctionsByCategory[auction.category] || 0) + 1;
    });

    const totalStartingPrice = auctions.reduce((sum, a) => sum + a.startingPrice, 0);
    const totalCurrentPrice = auctions.reduce((sum, a) => sum + a.currentPrice, 0);
    const priceIncrease = totalCurrentPrice - totalStartingPrice;

    res.status(200).json({
      success: true,
      data: {
        total: auctions.length,
        byStatus: auctionsByStatus,
        byCategory: auctionsByCategory,
        pricing: {
          totalStarting: totalStartingPrice,
          totalCurrent: totalCurrentPrice,
          increase: priceIncrease
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const newUsers = await User.find({
      createdAt: { $gte: startDate }
    }).select('role status createdAt');

    const usersByRole = {
      admin: newUsers.filter(u => u.role === 'admin').length,
      user: newUsers.filter(u => u.role === 'user').length
    };

    const usersByStatus = {
      active: newUsers.filter(u => u.status === 'active').length,
      blocked: newUsers.filter(u => u.status === 'blocked').length
    };

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: newUsers.length,
        byRole: usersByRole,
        byStatus: usersByStatus,
        growth: userGrowth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get bid analytics
// @route   GET /api/analytics/bids
// @access  Private/Admin
exports.getBidAnalytics = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const bids = await Bid.find({
      createdAt: { $gte: startDate }
    }).populate('auction', 'title status');

    const totalBids = bids.length;
    const totalAmount = bids.reduce((sum, b) => sum + b.amount, 0);
    const avgBidAmount = totalBids > 0 ? totalAmount / totalBids : 0;

    // Bids by auction status
    const bidsByAuctionStatus = {
      active: bids.filter(b => b.auction?.status === 'active').length,
      finished: bids.filter(b => b.auction?.status === 'finished').length
    };

    // Bid frequency over time
    const bidFrequency = await Bid.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalBids,
        totalAmount,
        averageAmount: avgBidAmount,
        byAuctionStatus: bidsByAuctionStatus,
        frequency: bidFrequency
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get proposal analytics
// @route   GET /api/analytics/proposals
// @access  Private/Admin
exports.getProposalAnalytics = async (req, res) => {
  try {
    const proposals = await Proposal.find();

    const byStatus = {
      pending: proposals.filter(p => p.status === 'pending').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length
    };

    const byCategory = {};
    proposals.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    const totalEstimatedValue = proposals.reduce((sum, p) => sum + p.estimatedValue, 0);

    res.status(200).json({
      success: true,
      data: {
        total: proposals.length,
        byStatus,
        byCategory,
        totalEstimatedValue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get public platform statistics for homepage banner
// @route   GET /api/analytics/public-stats
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const totalBids = await Bid.countDocuments();

    const auctions = await Auction.find().select('currentPrice startingPrice status');
    let totalVolume = 0;
    for (const a of auctions) {
      totalVolume += (a.currentPrice || a.startingPrice || 0);
    }

    res.status(200).json({
      success: true,
      data: {
        totalAuctions: totalAuctions,
        totalUsers: Math.max(totalUsers, 1),
        totalBids: totalBids,
        totalRevenue: totalVolume
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
