const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Por favor, insira o título do artigo'],
    trim: true,
    maxlength: [100, 'O título não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor, insira uma descrição detalhada'],
    maxlength: [2000, 'A descrição não pode ter mais de 2000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'Por favor, selecione uma categoria'],
    trim: true
  },
  estimatedValue: {
    type: Number,
    required: [true, 'Por favor, insira o valor estimado ou preço de reserva']
  },
  images: {
    type: [String],
    default: []
  },
  condition: {
    type: String,
    enum: ['Novo', 'Usado', 'Acidentado'],
    default: 'Usado'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: null
  },
  contactPhone: {
    type: String,
    required: [true, 'Por favor, insira um contacto telefónico']
  },
  contactEmail: {
    type: String,
    required: [true, 'Por favor, insira um e-mail de contacto'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um e-mail válido'
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', proposalSchema);
