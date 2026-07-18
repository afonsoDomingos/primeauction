const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.get('/conversations', protect, getConversations);
router.get('/messages/:userId', protect, getMessages);
router.post('/messages/:userId', protect, sendMessage);
router.put('/messages/:userId/read', protect, markAsRead);
router.get('/unread', protect, getUnreadCount);

module.exports = router;
