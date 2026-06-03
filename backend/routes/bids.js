const express = require('express');
const { getBids, placeBid } = require('../controllers/bidController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/:auctionId')
  .get(getBids)
  .post(protect, placeBid);

module.exports = router;
