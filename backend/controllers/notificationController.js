const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);

    // If user has no notifications yet, generate initial welcome notification
    if (notifications.length === 0) {
      const welcome = await Notification.create({
        user: req.user.id,
        title: 'Bem-vindo!',
        message: 'Bem-vindo à maior plataforma de leilões de Moçambique! 🔨',
        type: 'system',
        link: '/',
        read: false
      });
      return res.status(200).json({ success: true, count: 1, data: [welcome] });
    }

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markSingleRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper function to create notification programmatically
exports.createNotification = async ({ userId, title, message, type, link }) => {
  try {
    return await Notification.create({
      user: userId,
      title: title || 'Notificação',
      message,
      type: type || 'system',
      link: link || '/'
    });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
