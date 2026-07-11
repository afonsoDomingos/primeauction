const express = require('express');
const {
  createProposal,
  getMyProposals,
  getProposals,
  updateProposalStatus,
  uploadProposalImages
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadAuctionImage } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

// Upload images for a proposal (limit to max 5 images)
router.post('/upload-images', uploadAuctionImage.array('images', 5), uploadProposalImages);

router.route('/')
  .post(createProposal)
  .get(authorize('admin'), getProposals);

router.route('/myproposals')
  .get(getMyProposals);

router.route('/:id/status')
  .put(authorize('admin'), updateProposalStatus);

module.exports = router;
