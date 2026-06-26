const express = require('express');
const router = express.Router();
const {
  sendRegisterOtp,
  verifyRegisterOtp,
  sendLoginOtp,
  verifyLoginOtp,
  sendAdminOtp,
  verifyAdminOtp,
  resendOtp,
  logout,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  sendRegisterOtpValidator,
  verifyRegisterOtpValidator,
  sendLoginOtpValidator,
  verifyOtpValidator,
  resendOtpValidator,
  updateProfileValidator,
  addressValidator,
} = require('../validators/auth.validator');

// ─── OTP-based Registration ──────────────────────────
router.post('/register/send-otp', sendRegisterOtpValidator, validate, sendRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtpValidator, validate, verifyRegisterOtp);

// ─── OTP-based User Login ────────────────────────────
router.post('/login/send-otp', authLimiter, sendLoginOtpValidator, validate, sendLoginOtp);
router.post('/login/verify-otp', authLimiter, verifyOtpValidator, validate, verifyLoginOtp);

// ─── OTP-based Admin Login ───────────────────────────
router.post('/admin/send-otp', authLimiter, sendLoginOtpValidator, validate, sendAdminOtp);
router.post('/admin/verify-otp', authLimiter, verifyOtpValidator, validate, verifyAdminOtp);

// ─── Resend OTP ──────────────────────────────────────
router.post('/resend-otp', resendOtpValidator, validate, resendOtp);

// ─── Protected routes ────────────────────────────────
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, uploadSingle('profileImage'), updateProfileValidator, validate, updateProfile);

// ─── Address routes ──────────────────────────────────
router.post('/addresses', authenticate, addressValidator, validate, addAddress);
router.put('/addresses/:addressId', authenticate, addressValidator, validate, updateAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);

module.exports = router;
