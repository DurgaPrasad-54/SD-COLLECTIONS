const { body } = require('express-validator');

const createCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ max: 20 })
    .withMessage('Coupon code cannot exceed 20 characters'),
  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .notEmpty()
    .withMessage('Discount value is required')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('maxDiscountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
];

const updateCouponValidator = [
  body('code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Coupon code cannot exceed 20 characters'),
  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
];

const applyCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
  body('orderAmount')
    .notEmpty()
    .withMessage('Order amount is required')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),
];

module.exports = {
  createCouponValidator,
  updateCouponValidator,
  applyCouponValidator,
};
