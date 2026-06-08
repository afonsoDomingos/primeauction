const Category = require('../models/Category');

const defaultCategories = [
  'Veículos',
  'Imóveis e Equipamentos',
  'Electrónica e Tecnologia',
  'Mobiliário e Decoração',
  'Maquinaria Industrial',
  'Outros'
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort('name');
    
    // Seed default categories if database is empty
    if (categories.length === 0) {
      const docs = defaultCategories.map(name => ({ name }));
      await Category.insertMany(docs);
      categories = await Category.find().sort('name');
    }
    
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Por favor introduza o nome da categoria' });
    }
    
    // Check if exists
    let category = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (category) {
      return res.status(400).json({ success: false, error: 'Esta categoria já existe' });
    }
    
    category = await Category.create({ name: name.trim() });
    
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
