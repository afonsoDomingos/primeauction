const express = require('express');
const {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getAuctions)
  .post(protect, authorize('admin'), createAuction);

router.route('/:id')
  .get(getAuction)
  .put(protect, authorize('admin'), updateAuction)
  .delete(protect, authorize('admin'), deleteAuction);

module.exports = router;
