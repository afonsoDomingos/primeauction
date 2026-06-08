const express = require('express');
const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket
} = require('../controllers/supportController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .post(createTicket)
  .get(protect, authorize('admin'), getTickets);

router.route('/:id')
  .put(protect, authorize('admin'), updateTicket)
  .delete(protect, authorize('admin'), deleteTicket);

module.exports = router;
