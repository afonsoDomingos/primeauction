const express = require('express');
const router = express.Router();
const { vehicleMakes, vehicleColors, vehicleFeatures, vehicleYears, modelPriceSuggestions } = require('../data/vehicleData');

// Get vehicle data for frontend
router.get('/data', (req, res) => {
  try {
    res.json({
      success: true,
      vehicleMakes,
      vehicleColors,
      vehicleFeatures,
      vehicleYears,
      modelPriceSuggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load vehicle data'
    });
  }
});

module.exports = router;
