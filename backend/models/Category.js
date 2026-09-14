const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor adicione o nome da categoria'],
    unique: true,
    trim: true,
    maxlength: [50, 'O nome da categoria não pode ter mais de 50 caracteres']
  },
  // Automotive-specific fields
  isAutomotive: {
    type: Boolean,
    default: false
  },
  // For automotive category: available makes
  makes: [{
    name: {
      type: String,
      required: true
    },
    // Common models for this make
    popularModels: [{
      type: String
    }]
  }],
  // Vehicle types for filtering
  vehicleTypes: [{
    type: String,
    enum: ['Sedan', 'Hatchback', 'SUV', 'Coupé', 'Van', 'Pickup', 'Carrinha', 'Motociclo', 'Outro']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
