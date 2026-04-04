const Category = require('../models/Category');

// @desc    Get semua kategori (nested structure)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    // Transform to nested structure if needed by frontend
    // Or just return flat and let frontend handle it
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: error.message });
  }
};

// @desc    Buat kategori baru
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, order, parentCategory, visibility, allowedRoles } = req.body;
    
    const category = await Category.create({
      name,
      description,
      icon,
      order,
      parentCategory: parentCategory || null,
      visibility,
      allowedRoles
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat kategori', error: error.message });
  }
};

// @desc    Update kategori
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    
    const { name, description, icon, order, parentCategory, visibility, allowedRoles } = req.body;
    
    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    category.order = order !== undefined ? order : category.order;
    category.parentCategory = parentCategory || category.parentCategory;
    category.visibility = visibility || category.visibility;
    category.allowedRoles = allowedRoles || category.allowedRoles;
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kategori', error: error.message });
  }
};

// @desc    Hapus kategori
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    
    // Check if category has subcategories or topics
    // For now, just delete
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus kategori', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
