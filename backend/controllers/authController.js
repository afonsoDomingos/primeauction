const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto || null,
      phone: user.phone || null,
      bio: user.bio || null,
      province: user.province || null,
      gender: user.gender || null,
      age: user.age || null
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Is this the first user? If so, make them admin.
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper to get device info from request headers
const getDeviceInfo = (req) => {
  const ua = req.headers['user-agent'] || '';
  let browser = 'Navegador Web';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Windows';
  if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} (${os})`;
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const LoginLog = require('../models/LoginLog');
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '197.218.45.12';

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor, forneça o email e a palavra-passe.' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await LoginLog.create({
        userName: 'Desconhecido',
        email,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || '',
        deviceType: getDeviceInfo(req),
        status: 'failed'
      });
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      await LoginLog.create({
        user: user._id,
        userName: user.name,
        email: user.email,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || '',
        deviceType: getDeviceInfo(req),
        status: 'blocked_attempt'
      });
      return res.status(403).json({ 
        success: false, 
        error: 'A sua conta está temporariamente suspensa pela administração da Prime Auction. Contacte o suporte para mais detalhes.' 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await LoginLog.create({
        user: user._id,
        userName: user.name,
        email: user.email,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || '',
        deviceType: getDeviceInfo(req),
        status: 'failed'
      });
      return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }

    // Record successful login log
    await LoginLog.create({
      user: user._id,
      userName: user.name,
      email: user.email,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || '',
      deviceType: getDeviceInfo(req),
      status: 'success'
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update profile (name, email, password, phone, bio)
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, currentPassword, newPassword, province, gender, age } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, error: 'Este email já está em uso' });
      }
      user.email = email;
    }
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (province !== undefined) user.province = province;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Por favor insira a palavra-passe actual' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Palavra-passe actual incorrecta' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres' });
      }
      user.password = newPassword;
    }

    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload profile photo
// @route   PUT /api/auth/uploadphoto
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Por favor envie uma imagem' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: req.file.path },
      { new: true }
    );

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Forgot password — generate token and send email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Por favor forneça o email.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security, always return the same message even if not found
      return res.status(200).json({
        success: true,
        message: 'Se existir uma conta com este email, receberá um link de recuperação em breve.'
      });
    }

    // Generate a secure random reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Try to send email via nodemailer (if configured)
    const frontendUrl = process.env.FRONTEND_URL || 'https://primeauction.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Prime Auction" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Recuperação de Senha — Prime Auction',
        html: `
          <div style="font-family: Inter, sans-serif; background: #f8fafc; padding: 40px 20px;">
            <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <h2 style="color: #0f172a; font-size: 1.5rem; margin-bottom: 0.5rem;">🔑 Recuperar Senha</h2>
              <p style="color: #475569; margin-bottom: 1.5rem;">Olá <strong>${user.name}</strong>, recebemos um pedido de recuperação da sua senha.</p>
              <a href="${resetUrl}" style="display: inline-block; background: #1a56db; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 1rem; margin-bottom: 1.5rem;">Redefinir Senha</a>
              <p style="color: #94a3b8; font-size: 0.85rem;">Este link expira em <strong>30 minutos</strong>. Se não foi você a pedir, ignore este email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
              <p style="color: #cbd5e1; font-size: 0.75rem;">© Prime Auction Moçambique</p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.warn('Email sending failed (credentials not configured):', emailErr.message);
      // Still return the reset token in development mode for testing
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          message: 'Email não configurado. Link de recuperação (modo dev):',
          resetUrl
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Se existir uma conta com este email, receberá um link de recuperação em breve.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, error: 'Dados incompletos para redefinição de senha.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Link de recuperação inválido ou expirado. Por favor solicite um novo.' });
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
