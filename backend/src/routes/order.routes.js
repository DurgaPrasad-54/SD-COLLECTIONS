const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  placeOrderValidator,
  updateOrderStatusValidator,
} = require('../validators/order.validator');

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', placeOrderValidator, validate, placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatusValidator, validate, updateOrderStatus);

module.exports = router;
