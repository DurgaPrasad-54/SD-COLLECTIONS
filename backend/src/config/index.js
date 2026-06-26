require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5253,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/SD',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7,

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'SD COLLECTIONS <noreply@sdclothing.com>',
  },

  // OTP
  otp: {
    expireMinutes: parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 5,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN, 10) || 60,
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  // Client URL
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Cloudinary (optional)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = config;
