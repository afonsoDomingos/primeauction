const express = require('express');
const { getUsers, toggleBlockUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id/block')
  .put(toggleBlockUser);

module.exports = router;
