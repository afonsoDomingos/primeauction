const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment, toggleCommentLike } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

router.route('/:auctionId')
  .get(getComments)
  .post(protect, addComment);

router.route('/item/:commentId')
  .delete(protect, deleteComment);

router.route('/item/:commentId/like')
  .post(protect, toggleCommentLike);

module.exports = router;
