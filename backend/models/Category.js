const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor adicione o nome da categoria'],
    unique: true,
    trim: true,
    maxlength: [50, 'O nome da categoria não pode ter mais de 50 caracteres']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
