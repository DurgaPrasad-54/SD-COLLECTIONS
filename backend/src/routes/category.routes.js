const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../validators/category.validator');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authenticate, authorize('admin'), uploadSingle('image'), createCategoryValidator, validate, createCategory);
router.put('/:id', authenticate, authorize('admin'), uploadSingle('image'), updateCategoryValidator, validate, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

module.exports = router;
