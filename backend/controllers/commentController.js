const Comment = require('../models/Comment');
const Auction = require('../models/Auction');

// @desc    Get comments for an auction
// @route   GET /api/comments/:auctionId
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ auction: req.params.auctionId })
      .populate({ path: 'user', select: 'name profilePhoto role' })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Add comment to an auction
// @route   POST /api/comments/:auctionId
// @access  Private/User
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const auctionId = req.params.auctionId;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Por favor escreva um comentário' });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Leilão não encontrado' });
    }

    const comment = await Comment.create({
      auction: auctionId,
      user: req.user.id,
      text: text.trim()
    });

    await comment.populate({ path: 'user', select: 'name profilePhoto role' });

    // Real-time emit to room
    req.io.to(auctionId).emit('new_comment', comment);

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private/User
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Não tem permissão para eliminar este comentário' });
    }

    const auctionId = comment.auction.toString();
    await comment.deleteOne();

    req.io.to(auctionId).emit('comment_deleted', { commentId: req.params.commentId });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Like or unlike a comment
// @route   POST /api/comments/:commentId/like
// @access  Private/User
exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
    }

    const userId = req.user.id;
    const index = comment.likes.indexOf(userId);

    let isLiked = false;
    if (index === -1) {
      comment.likes.push(userId);
      isLiked = true;
    } else {
      comment.likes.splice(index, 1);
      isLiked = false;
    }

    await comment.save();
    await comment.populate({ path: 'user', select: 'name profilePhoto role' });

    const auctionId = comment.auction.toString();
    req.io.to(auctionId).emit('comment_like_updated', {
      commentId: comment._id,
      likes: comment.likes,
      likesCount: comment.likes.length
    });

    res.status(200).json({ success: true, isLiked, likesCount: comment.likes.length, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
