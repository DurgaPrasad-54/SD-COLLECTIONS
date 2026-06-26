const express = require('express');
const router = express.Router();

// Mount all route modules
router.use('/auth', require('./auth.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/orders', require('./order.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/coupons', require('./coupon.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/banners', require('./banner.routes'));
router.use('/admin', require('./admin.routes'));

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SD COLLECTIONS API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
