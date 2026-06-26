const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesAnalytics,
  getLowStockProducts,
  getTopSellingProducts,
  getUsers,
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require admin auth
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/top-products', getTopSellingProducts);
router.get('/products/low-stock', getLowStockProducts);
router.get('/users', getUsers);

module.exports = router;
