const express = require('express');
const router = express.Router();
const { getCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/tree', getCategoryTree);
router.get('/', getCategories);
router.get('/:identifier', getCategory);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
