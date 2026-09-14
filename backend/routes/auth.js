const express = require('express');
const { register, login, getMe, updateProfile, uploadProfilePhoto, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { uploadProfilePhoto: uploadMiddleware } = require('../config/cloudinary');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/uploadphoto', protect, uploadMiddleware.single('photo'), uploadProfilePhoto);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}`);
  });
  
  console.log('✅ Google OAuth routes configured');
} else {
  console.log('⚠️ Google OAuth credentials not found, skipping Google OAuth routes');
}

module.exports = router;
