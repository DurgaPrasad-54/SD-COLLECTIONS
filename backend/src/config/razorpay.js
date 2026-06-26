const Razorpay = require('razorpay');
const config = require('./index');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      console.warn('⚠️  Razorpay credentials not configured. Payment features will not work.');
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

module.exports = getRazorpayInstance;
