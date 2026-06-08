const SupportTicket = require('../models/SupportTicket');

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Public
exports.createTicket = async (req, res) => {
  try {
    const { email, phone, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please add a message' });
    }

    const ticket = await SupportTicket.create({
      email,
      phone,
      message
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all support tickets
// @route   GET /api/support
// @access  Private/Admin
exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a support ticket status
// @route   PUT /api/support/:id
// @access  Private/Admin
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: `Ticket not found with id of ${req.params.id}` });
    }

    // Update fields
    if (req.body.status) {
      ticket.status = req.body.status;
    }

    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a support ticket
// @route   DELETE /api/support/:id
// @access  Private/Admin
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, error: `Ticket not found with id of ${req.params.id}` });
    }

    await SupportTicket.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
