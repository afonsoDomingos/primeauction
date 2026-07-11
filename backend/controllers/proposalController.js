const Proposal = require('../models/Proposal');

// @desc    Create a new article proposal
// @route   POST /api/proposals
// @access  Private
exports.createProposal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      estimatedValue,
      images,
      condition,
      contactPhone,
      contactEmail
    } = req.body;

    const proposal = await Proposal.create({
      user: req.user.id,
      title,
      description,
      category,
      estimatedValue,
      images,
      condition,
      contactPhone,
      contactEmail
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current user's proposals
// @route   GET /api/proposals/myproposals
// @access  Private
exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Private/Admin
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate({ path: 'user', select: 'name email profilePhoto' })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update proposal status
// @route   PUT /api/proposals/:id/status
// @access  Private/Admin
exports.updateProposalStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    }

    proposal.status = status;
    if (adminNotes !== undefined) {
      proposal.adminNotes = adminNotes;
    }

    await proposal.save();

    res.status(200).json({ success: true, data: proposal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload proposal images
// @route   POST /api/proposals/upload-images
// @access  Private
exports.uploadProposalImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Por favor, envie pelo menos uma imagem' });
    }

    const urls = req.files.map(file => file.path);
    res.status(200).json({ success: true, data: urls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
