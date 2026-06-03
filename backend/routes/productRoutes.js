const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts,
  getSearchSuggestions, createProduct, updateProduct, deleteProduct, updateStock
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:identifier', getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), upload.array('images', 10), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 10), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin'), updateStock);

module.exports = router;
