const express = require('express');
const {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  uploadAuctionImage,
  uploadAuctionImages
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadAuctionImage: uploadMiddleware } = require('../config/cloudinary');

const router = express.Router();

// Image upload routes (must be before /:id routes)
router.post(
  '/upload-image',
  protect,
  authorize('admin'),
  uploadMiddleware.single('image'),
  uploadAuctionImage
);

router.post(
  '/upload-images',
  protect,
  authorize('admin'),
  uploadMiddleware.array('images', 10),
  uploadAuctionImages
);

router.route('/')
  .get(getAuctions)
  .post(protect, authorize('admin'), createAuction);

router.route('/:id')
  .get(getAuction)
  .put(protect, authorize('admin'), updateAuction)
  .delete(protect, authorize('admin'), deleteAuction);

module.exports = router;
