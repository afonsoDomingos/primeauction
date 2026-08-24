const mongoose = require('mongoose');
const Review = require('../models/Review');
const Auction = require('../models/Auction');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create a review for an auction counterparty
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { auctionId, rating, comment } = req.body;

    if (!auctionId || !rating) {
      return res.status(400).json({ success: false, error: 'Forneça o leilão e a classificação (1 a 5).' });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, error: 'A classificação deve ser entre 1 e 5 estrelas.' });
    }

    // Find auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Leilão não encontrado.' });
    }

    // Check if auction is finished
    const isEnded = auction.status === 'finished' || Date.now() > new Date(auction.endTime).getTime();
    if (!isEnded) {
      return res.status(400).json({ success: false, error: 'Apenas pode avaliar leilões que já estejam encerrados.' });
    }

    if (!auction.winner) {
      return res.status(400).json({ success: false, error: 'Este leilão não teve um vencedor registrado.' });
    }

    const currentUserId = req.user.id.toString();
    const sellerId = auction.createdBy.toString();
    const winnerId = auction.winner.toString();

    let reviewedUserId = null;
    let type = null;

    if (currentUserId === winnerId) {
      // Current user is winner -> evaluating the seller
      reviewedUserId = sellerId;
      type = 'seller';
    } else if (currentUserId === sellerId) {
      // Current user is seller -> evaluating the buyer/winner
      reviewedUserId = winnerId;
      type = 'buyer';
    } else {
      return res.status(403).json({ success: false, error: 'Apenas o vendedor e o vencedor deste leilão podem deixar uma avaliação.' });
    }

    if (currentUserId === reviewedUserId) {
      return res.status(400).json({ success: false, error: 'Não pode avaliar-se a si próprio.' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reviewer: req.user.id, auction: auctionId });
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'Já submeteu uma avaliação para este leilão.' });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      reviewedUser: reviewedUserId,
      auction: auctionId,
      rating: numericRating,
      comment: comment || '',
      type
    });

    // Recalculate average rating & ratings count for reviewed user
    const stats = await Review.aggregate([
      { $match: { reviewedUser: new mongoose.Types.ObjectId(reviewedUserId) } },
      {
        $group: {
          _id: '$reviewedUser',
          averageRating: { $avg: '$rating' },
          ratingsCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].averageRating * 10) / 10;
      await User.findByIdAndUpdate(reviewedUserId, {
        averageRating: avg,
        ratingsCount: stats[0].ratingsCount
      });
    }

    // Send notification to reviewed user
    try {
      await createNotification({
        userId: reviewedUserId,
        title: 'Nova Avaliação Recebida ⭐',
        message: `Recebeu uma avaliação de ${numericRating}/5 estrelas referente ao leilão "${auction.title}".`,
        type: 'system',
        link: `/profile`
      });
    } catch (notifErr) {
      console.error('Error creating review notification:', notifErr);
    }

    const populatedReview = await Review.findById(review._id).populate({ path: 'reviewer', select: 'name profilePhoto' });

    res.status(201).json({ success: true, data: populatedReview });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get reviews received by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate({ path: 'reviewer', select: 'name profilePhoto' })
      .populate({ path: 'auction', select: 'title imageUrl' })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user's review for an auction
// @route   GET /api/reviews/auction/:auctionId
// @access  Private
exports.getAuctionReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      reviewer: req.user.id,
      auction: req.params.auctionId
    }).populate({ path: 'reviewer', select: 'name profilePhoto' });

    res.status(200).json({ success: true, data: review || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
