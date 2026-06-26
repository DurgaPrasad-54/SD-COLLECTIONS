const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require('../controllers/coupon.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCouponValidator,
  updateCouponValidator,
  applyCouponValidator,
} = require('../validators/coupon.validator');

// User route
router.post('/apply', authenticate, applyCouponValidator, validate, applyCoupon);

// Admin routes
router.get('/', authenticate, authorize('admin'), getCoupons);
router.get('/:id', authenticate, authorize('admin'), getCouponById);
router.post('/', authenticate, authorize('admin'), createCouponValidator, validate, createCoupon);
router.put('/:id', authenticate, authorize('admin'), updateCouponValidator, validate, updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

module.exports = router;
