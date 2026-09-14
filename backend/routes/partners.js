const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Get all active partners (public)
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// Get all partners (admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1, name: 1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// Create partner (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.status(201).json(partner);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Parceiro com este nome já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar parceiro' });
  }
});

// Update partner (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!partner) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar parceiro' });
  }
});

// Delete partner (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }
    res.json({ message: 'Parceiro removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover parceiro' });
  }
});

// Delete all partners (admin only)
router.delete('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Partner.deleteMany({});
    res.json({ message: 'Todos os parceiros removidos com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover todos os parceiros' });
  }
});

module.exports = router;