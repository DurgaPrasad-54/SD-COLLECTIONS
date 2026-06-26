const crypto = require('crypto');

/**
 * Generate a unique order number.
 * Format: SD-YYYYMMDD-XXXXXX (random hex)
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SD-${dateStr}-${random}`;
};

/**
 * Calculate tax amount.
 * @param {number} subtotal - Cart subtotal
 * @param {number} taxRate - Tax rate percentage (default 18% GST)
 * @returns {number} tax amount rounded to 2 decimals
 */
const calculateTax = (subtotal, taxRate = 18) => {
  return 0; // Tax removed as per request
};

/**
 * Calculate shipping charge based on subtotal.
 * Free shipping above ₹999
 * @param {number} subtotal
 * @returns {number} shipping charge
 */
const calculateShipping = (subtotal) => {
  if (subtotal >= 500) return 0;
  return 40;
};

/**
 * Generate a cryptographically random 6-digit OTP.
 * @returns {string} 6-digit numeric OTP
 */
const generateOtp = () => {
  // Generate a random number between 100000 and 999999
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  const otp = 100000 + (num % 900000);
  return otp.toString();
};

/**
 * Hash an OTP using SHA256 for secure storage.
 * @param {string} otp - The plaintext OTP
 * @returns {string} Hashed OTP
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = {
  generateOrderNumber,
  calculateTax,
  calculateShipping,
  generateOtp,
  hashOtp,
};
