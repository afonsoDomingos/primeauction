const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markSingleRead
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markSingleRead);

module.exports = router;
