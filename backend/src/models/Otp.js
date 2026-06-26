const mongoose = require('mongoose');
const config = require('../config');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['login', 'register', 'admin-login'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + config.otp.expireMinutes * 60 * 1000),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: MongoDB automatically deletes documents after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient lookups
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
