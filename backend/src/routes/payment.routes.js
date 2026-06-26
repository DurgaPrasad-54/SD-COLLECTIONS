const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;
