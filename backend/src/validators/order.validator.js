const { body } = require('express-validator');

const placeOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required'),
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['COD', 'Razorpay', 'UPI', 'NetBanking'])
    .withMessage('Invalid payment method'),
  body('couponCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Coupon code cannot exceed 20 characters'),
];

const updateOrderStatusValidator = [
  body('orderStatus')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Invalid order status'),
];

module.exports = {
  placeOrderValidator,
  updateOrderStatusValidator,
};
