const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Get all unique users the current user has conversations with
    const sentMessages = await Message.find({ sender: req.user.id })
      .distinct('receiver');
    const receivedMessages = await Message.find({ receiver: req.user.id })
      .distinct('sender');
    
    const conversationUserIds = [...new Set([...sentMessages, ...receivedMessages])];
    
    // Get user details for each conversation
    const conversations = await User.find({
      _id: { $in: conversationUserIds }
    }).select('name email profilePhoto');
    
    // Get last message and unread count for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: user._id },
            { sender: user._id, receiver: req.user.id }
          ]
        }).sort('-createdAt');
        
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: req.user.id,
          read: false
        });
        
        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            sender: lastMessage.sender.toString()
          } : null,
          unreadCount
        };
      })
    );
    
    // Sort by last message date
    conversationsWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });
    
    res.status(200).json({ success: true, data: conversationsWithDetails });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get messages between current user and another user
// @route   GET /api/chat/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        read: false
      },
      { read: true }
    );
    
    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'name profilePhoto')
    .populate('receiver', 'name profilePhoto')
    .sort('createdAt');
    
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages/:userId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, auctionId } = req.body;
    
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const message = await Message.create({
      sender: req.user.id,
      receiver: userId,
      content,
      auction: auctionId || null
    });
    
    await message.populate('sender', 'name profilePhoto');
    await message.populate('receiver', 'name profilePhoto');
    
    // Emit socket event
    req.io.to(`user_${userId}`).emit('new_message', message);
    
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/:userId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false
    });
    
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
