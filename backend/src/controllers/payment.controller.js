const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/payment.service');
const { sendPaymentSuccess } = require('../services/email.service');
const config = require('../config');

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createPaymentOrder = async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Verify ownership
  if (order.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized.', 403));
  }

  if (order.paymentStatus === 'Paid') {
    return next(new AppError('This order is already paid.', 400));
  }

  // Create Razorpay order
  const razorpayOrder = await createRazorpayOrder(order.totalAmount, order.orderNumber);

  // Save Razorpay order ID
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpay.keyId,
    },
  });
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Missing payment verification data.', 400));
  }

  // Verify signature
  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    return next(new AppError('Payment verification failed. Invalid signature.', 400));
  }

  // Update order
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) {
    return next(new AppError('Order not found for this payment.', 404));
  }

  order.paymentStatus = 'Paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.orderStatus = 'Confirmed';
  await order.save();

  // Send payment success email (non-blocking)
  const user = req.user;
  sendPaymentSuccess(order, user);

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully.',
    data: order,
  });
};

/**
 * @desc    Get payment status for an order
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
const getPaymentStatus = async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).select(
    'orderNumber paymentStatus paymentMethod razorpayOrderId razorpayPaymentId totalAmount'
  );

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Verify ownership
  if (order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized.', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
};
