const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  uploadProductImages,
  getProductsByCategory,
} = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadMultiple } = require('../middleware/upload');
const {
  createProductValidator,
  updateProductValidator,
} = require('../validators/product.validator');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticate, authorize('admin'), uploadMultiple('images', 5), createProductValidator, validate, createProduct);
router.put('/:id', authenticate, authorize('admin'), uploadMultiple('images', 5), updateProductValidator, validate, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.post('/:id/images', authenticate, authorize('admin'), uploadMultiple('images', 5), uploadProductImages);

module.exports = router;
