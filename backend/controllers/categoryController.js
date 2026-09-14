const Category = require('../models/Category');
const { vehicleMakes, vehicleTypes } = require('../data/vehicleData');

const defaultCategories = [
  { 
    name: 'Veículos', 
    isAutomotive: true,
    makes: vehicleMakes,
    vehicleTypes: ['Sedan', 'Hatchback', 'SUV', 'Coupé', 'Van', 'Pickup', 'Carrinha', 'Motociclo', 'Outro']
  },
  { 
    name: 'Imóveis e Equipamentos', 
    isAutomotive: false 
  },
  { 
    name: 'Electrónica e Tecnologia', 
    isAutomotive: false 
  },
  { 
    name: 'Mobiliário e Decoração', 
    isAutomotive: false 
  },
  { 
    name: 'Maquinaria Industrial', 
    isAutomotive: false 
  },
  { 
    name: 'Outros', 
    isAutomotive: false 
  }
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort('name');
    
    // Seed default categories if database is empty
    if (categories.length === 0) {
      await Category.insertMany(defaultCategories);
      categories = await Category.find().sort('name');
    }
    
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get category with vehicle data
// @route   GET /api/categories/:name
// @access  Public
exports.getCategoryByName = async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name });
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }
    
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, isAutomotive, makes, vehicleTypes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Por favor introduza o nome da categoria' });
    }
    
    // Check if exists
    let category = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (category) {
      return res.status(400).json({ success: false, error: 'Esta categoria já existe' });
    }
    
    const categoryData = { name: name.trim() };
    
    // If it's an automotive category, add vehicle data
    if (isAutomotive) {
      categoryData.isAutomotive = true;
      if (makes && makes.length > 0) {
        categoryData.makes = makes;
      } else {
        // Default to common vehicle makes if not provided
        categoryData.makes = vehicleMakes.slice(0, 10); // Top 10 makes
      }
      
      if (vehicleTypes && vehicleTypes.length > 0) {
        categoryData.vehicleTypes = vehicleTypes;
      } else {
        categoryData.vehicleTypes = ['Sedan', 'Hatchback', 'SUV', 'Pickup', 'Motociclo'];
      }
    }
    
    category = await Category.create(categoryData);
    
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, isAutomotive, makes, vehicleTypes } = req.body;
    
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }
    
    if (name) category.name = name.trim();
    if (isAutomotive !== undefined) category.isAutomotive = isAutomotive;
    if (makes) category.makes = makes;
    if (vehicleTypes) category.vehicleTypes = vehicleTypes;
    
    await category.save();
    
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
    }
    
    await category.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
