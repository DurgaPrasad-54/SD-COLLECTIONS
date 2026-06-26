const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
} = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReviewValidator,
  updateReviewValidator,
} = require('../validators/review.validator');

// Public route
router.get('/:productId', getProductReviews);

// Protected routes
router.post('/:productId', authenticate, createReviewValidator, validate, createReview);
router.put('/:id', authenticate, updateReviewValidator, validate, updateReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
