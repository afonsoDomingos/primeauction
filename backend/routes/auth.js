const express = require('express');
const { register, login, getMe, updateProfile, uploadProfilePhoto, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { uploadProfilePhoto: uploadMiddleware } = require('../config/cloudinary');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/uploadphoto', protect, uploadMiddleware.single('photo'), uploadProfilePhoto);

module.exports = router;
