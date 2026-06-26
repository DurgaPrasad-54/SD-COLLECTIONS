const express = require('express');
const router = express.Router();
const {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} = require('../controllers/banner.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public route
router.get('/', getBanners);

// Admin routes
router.post('/', authenticate, authorize('admin'), uploadSingle('image'), createBanner);
router.put('/:id', authenticate, authorize('admin'), uploadSingle('image'), updateBanner);
router.delete('/:id', authenticate, authorize('admin'), deleteBanner);

module.exports = router;
