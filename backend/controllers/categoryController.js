const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc    Get all categories (with optional parent filter)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { parent, active = 'true' } = req.query;
  const query = {};

  if (active === 'true') query.isActive = true;
  if (parent === 'null' || parent === 'root') {
    query.parent = null;
  } else if (parent) {
    query.parent = parent;
  }

  const categories = await Category.find(query)
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({ success: true, categories });
});

// @desc    Get category tree (root categories with subcategories)
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const rootCategories = await Category.find({ parent: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });

  const tree = await Promise.all(
    rootCategories.map(async (cat) => {
      const subcategories = await Category.find({ parent: cat._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 });
      return { ...cat.toObject(), subcategories };
    })
  );

  res.status(200).json({ success: true, categories: tree });
});

// @desc    Get single category by slug or ID
// @route   GET /api/categories/:identifier
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  const category = await Category.findOne(
    isObjectId ? { _id: identifier } : { slug: identifier }
  ).populate('parent', 'name slug');

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json({ success: true, category });
});

// @desc    Create category (admin)
// @route   POST /api/categories
// @access  Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, message: 'Category created', category });
});

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json({ success: true, message: 'Category updated', category });
});

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check for subcategories
  const hasChildren = await Category.findOne({ parent: category._id });
  if (hasChildren) {
    res.status(400);
    throw new Error('Cannot delete category with subcategories. Delete or reassign subcategories first.');
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory };
