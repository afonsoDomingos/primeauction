const express = require('express');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

router.route('/subscribers')
  .get(protect, authorize('admin'), getSubscribers);

router.route('/subscribers/:id')
  .delete(protect, authorize('admin'), deleteSubscriber);

router.route('/subscribers/:id/toggle')
  .put(protect, authorize('admin'), toggleSubscriberStatus);

module.exports = router;
