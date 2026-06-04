const Settings = require('../models/Settings');

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
