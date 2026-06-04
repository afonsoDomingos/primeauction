const express = require('express');
const { register, login, getMe, updateProfile, uploadProfilePhoto } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { uploadProfilePhoto: uploadMiddleware } = require('../config/cloudinary');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/uploadphoto', protect, uploadMiddleware.single('photo'), uploadProfilePhoto);

module.exports = router;
