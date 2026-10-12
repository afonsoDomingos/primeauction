const Settings = require('../models/Settings');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get settings by key
// @route   GET /api/settings/:key
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: req.params.key });
    
    if (!settings) {
      return res.status(404).json({ success: false, error: `Settings not found for key: ${req.params.key}` });
    }

    res.status(200).json({ success: true, data: settings.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create or update settings by key
// @route   PUT /api/settings/:key
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: req.params.key });

    if (settings) {
      settings.value = req.body;
      await settings.save();
    } else {
      settings = await Settings.create({
        key: req.params.key,
        value: req.body
      });
    }

    res.status(200).json({ success: true, data: settings.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload banner images and save URLs to settings
// @route   POST /api/settings/banners/upload
// @access  Private/Admin
exports.uploadBanners = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum ficheiro enviado.' });
    }

    const newUrls = req.files.map(f => f.path);

    // Get or create banner settings
    let settings = await Settings.findOne({ key: 'heroBanners' });
    const existing = settings ? (settings.value.urls || []) : [];

    const combined = [...existing, ...newUrls].slice(0, 10); // max 10 banners

    if (settings) {
      settings.value = { urls: combined, mobileUrls: settings.value.mobileUrls || [] };
      await settings.save();
    } else {
      settings = await Settings.create({
        key: 'heroBanners',
        value: { urls: combined, mobileUrls: [] }
      });
    }

    res.status(200).json({ success: true, data: settings.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Remove a banner image by URL
// @route   DELETE /api/settings/banners/remove
// @access  Private/Admin
exports.removeBanner = async (req, res) => {
  try {
    const { url, type } = req.body; // type: 'desktop' | 'mobile'
    if (!url) return res.status(400).json({ success: false, error: 'URL obrigatória.' });

    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const fileWithExt = parts[parts.length - 1];
    const file = fileWithExt.split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${file}`;

    try {
      await cloudinary.uploader.destroy(`prime-auction/banners/${file}`);
    } catch (e) {
      console.warn('Could not delete from Cloudinary:', e.message);
    }

    let settings = await Settings.findOne({ key: 'heroBanners' });
    if (!settings) return res.status(404).json({ success: false, error: 'Sem banners configurados.' });

    const isMobile = type === 'mobile';
    if (isMobile) {
      settings.value.mobileUrls = (settings.value.mobileUrls || []).filter(u => u !== url);
    } else {
      settings.value.urls = (settings.value.urls || []).filter(u => u !== url);
    }
    settings.markModified('value');
    await settings.save();

    res.status(200).json({ success: true, data: settings.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
