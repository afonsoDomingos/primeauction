const express = require('express');
const { getSettings, updateSettings, uploadBanners, removeBanner } = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadBannerImage } = require('../config/cloudinary');

const router = express.Router();

// Banner management
router.post('/banners/upload', protect, authorize('admin'), uploadBannerImage.array('banners', 10), uploadBanners);
router.delete('/banners/remove', protect, authorize('admin'), removeBanner);

// Generic key-based settings
router.route('/:key')
  .get(getSettings)
  .put(protect, authorize('admin'), updateSettings);

module.exports = router;
