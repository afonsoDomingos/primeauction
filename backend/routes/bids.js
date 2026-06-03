const express = require('express');
const { getBids, placeBid, getMyBids } = require('../controllers/bidController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/mybids')
  .get(protect, getMyBids);

router.route('/:auctionId')
  .get(getBids)
  .post(protect, placeBid);

module.exports = router;
