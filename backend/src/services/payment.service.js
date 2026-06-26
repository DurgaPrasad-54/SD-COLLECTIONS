const crypto = require('crypto');
const getRazorpayInstance = require('../config/razorpay');
const AppError = require('../utils/AppError');

/**
 * Create a Razorpay order.
 * @param {number} amount - Amount in INR (rupees, not paise)
 * @param {string} receipt - Order ID or receipt string
 * @returns {Promise<Object>} Razorpay order object
 */
const createRazorpayOrder = async (amount, receipt) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new AppError('Payment service is not configured. Please contact support.', 503);
  }

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency: 'INR',
    receipt: receipt,
    payment_capture: 1, // Auto-capture after payment
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new AppError('Failed to create payment order. Please try again.', 500);
  }
};

/**
 * Verify Razorpay payment signature.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether the signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new AppError('Payment service is not configured.', 503);
  }

  const config = require('../config');
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Fetch payment details from Razorpay.
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new AppError('Payment service is not configured.', 503);
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw new AppError('Failed to fetch payment details.', 500);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
};
