const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/:key')
  .get(getSettings)
  .put(protect, authorize('admin'), updateSettings);

module.exports = router;
