const User = require('../models/User');
const Otp = require('../models/Otp');
const AppError = require('../utils/AppError');
const config = require('../config');
const { sendRegistrationEmail, sendOtpEmail } = require('../services/email.service');
const { generateOtp, hashOtp } = require('../utils/helpers');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

// ─── Helper: Create & send OTP ────────────────────────
const createAndSendOtp = async (email, purpose) => {
  // Delete any existing OTP for this email+purpose
  await Otp.deleteMany({ email, purpose });

  // Generate new OTP
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  // Store hashed OTP in DB
  await Otp.create({
    email,
    otp: hashedOtp,
    purpose,
    expiresAt: new Date(Date.now() + config.otp.expireMinutes * 60 * 1000),
  });

  // Send OTP email
  await sendOtpEmail(email, otp, purpose);
};

// ─── Helper: Verify OTP ───────────────────────────────
const verifyOtpRecord = async (email, otp, purpose) => {
  const otpRecord = await Otp.findOne({ email, purpose });

  if (!otpRecord) {
    throw new AppError('OTP not found. Please request a new OTP.', 400);
  }

  // Check if expired
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Check max attempts
  if (otpRecord.attempts >= config.otp.maxAttempts) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new AppError('Too many failed attempts. Please request a new OTP.', 429);
  }

  // Verify OTP
  const hashedInput = hashOtp(otp);
  if (hashedInput !== otpRecord.otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = config.otp.maxAttempts - otpRecord.attempts;
    throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400);
  }

  // OTP verified — delete it
  await Otp.deleteOne({ _id: otpRecord._id });
};

// ─── Helper: Send token response with cookie ──────────
const sendTokenResponse = (user, token, statusCode, res) => {
  const options = {
    expires: new Date(Date.now() + config.jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
  };

  const userData = user.toObject();

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: userData,
  });
};

/**
 * @desc    Send OTP for new user registration
 * @route   POST /api/auth/register/send-otp
 * @access  Public
 */
const sendRegisterOtp = async (req, res, next) => {
  const { email } = req.body;

  // Check if a user account already exists with this email
  const existingUser = await User.findOne({ email, role: 'user' });
  if (existingUser) {
    return next(new AppError('A user account with this email already exists.', 400));
  }

  await createAndSendOtp(email, 'register');

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
  });
};

/**
 * @desc    Verify OTP and complete registration
 * @route   POST /api/auth/register/verify-otp
 * @access  Public
 */
const verifyRegisterOtp = async (req, res, next) => {
  const { name, email, phone, otp } = req.body;

  // Check again if user already exists (race condition guard)
  const existingUser = await User.findOne({ email, role: 'user' });
  if (existingUser) {
    return next(new AppError('A user account with this email already exists.', 400));
  }

  // Verify OTP
  await verifyOtpRecord(email, otp, 'register');

  // Create user (role defaults to 'user')
  const user = await User.create({ name, email, phone });

  // Generate token
  const token = user.generateAuthToken();

  // Send welcome email (non-blocking)
  sendRegistrationEmail(user);

  sendTokenResponse(user, token, 201, res);
};

/**
 * @desc    Send OTP for user login
 * @route   POST /api/auth/login/send-otp
 * @access  Public
 */
const sendLoginOtp = async (req, res, next) => {
  const { email } = req.body;

  // Check if a user account exists with this email
  const user = await User.findOne({ email, role: 'user' });
  if (!user) {
    return next(new AppError('No user account found with this email.', 404));
  }

  await createAndSendOtp(email, 'login');

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email. Please verify to log in.',
  });
};

/**
 * @desc    Verify OTP and login user
 * @route   POST /api/auth/login/verify-otp
 * @access  Public
 */
const verifyLoginOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  // Check if a user account exists
  const user = await User.findOne({ email, role: 'user' });
  if (!user) {
    return next(new AppError('No user account found with this email.', 404));
  }

  // Verify OTP
  await verifyOtpRecord(email, otp, 'login');

  const token = user.generateAuthToken();
  sendTokenResponse(user, token, 200, res);
};

/**
 * @desc    Send OTP for admin login
 * @route   POST /api/auth/admin/send-otp
 * @access  Public
 */
const sendAdminOtp = async (req, res, next) => {
  const { email } = req.body;

  // Check if an admin account exists with this email
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    return next(new AppError('Invalid admin credentials.', 403));
  }

  await createAndSendOtp(email, 'admin-login');

  res.status(200).json({
    success: true,
    message: 'OTP sent to your admin email. Please verify to log in.',
  });
};

/**
 * @desc    Verify OTP and login admin
 * @route   POST /api/auth/admin/verify-otp
 * @access  Public
 */
const verifyAdminOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  // Check if an admin account exists
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    return next(new AppError('Invalid admin credentials.', 403));
  }

  // Verify OTP
  await verifyOtpRecord(email, otp, 'admin-login');

  const token = user.generateAuthToken();
  sendTokenResponse(user, token, 200, res);
};

/**
 * @desc    Resend OTP (with cooldown)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  const { email, purpose } = req.body;

  // Check cooldown — find the most recent OTP for this email+purpose
  const existingOtp = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });

  if (existingOtp) {
    const timeSinceCreated = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
    if (timeSinceCreated < config.otp.resendCooldownSeconds) {
      const waitTime = Math.ceil(config.otp.resendCooldownSeconds - timeSinceCreated);
      return next(
        new AppError(`Please wait ${waitTime} seconds before requesting a new OTP.`, 429)
      );
    }
  }

  // Validate based on purpose
  if (purpose === 'login') {
    const user = await User.findOne({ email, role: 'user' });
    if (!user) {
      return next(new AppError('No user account found with this email.', 404));
    }
  } else if (purpose === 'admin-login') {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return next(new AppError('Invalid admin credentials.', 403));
    }
  } else if (purpose === 'register') {
    const existingUser = await User.findOne({ email, role: 'user' });
    if (existingUser) {
      return next(new AppError('A user account with this email already exists.', 400));
    }
  }

  await createAndSendOtp(email, purpose);

  res.status(200).json({
    success: true,
    message: 'A new OTP has been sent to your email.',
  });
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000), // Expires in 5 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  const fieldsToUpdate = {};
  const allowedFields = ['name', 'phone', 'profileImage'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  // Handle profile image upload
  if (req.file) {
    const userToUpdate = await User.findById(req.user.id);
    if (userToUpdate && userToUpdate.profileImage && userToUpdate.profileImage.publicId) {
      await deleteImage(userToUpdate.profileImage.publicId);
    }
    fieldsToUpdate.profileImage = await uploadImage(req.file.buffer, 'users');
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
};

/**
 * @desc    Add user address
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = async (req, res) => {
  // Temporary migration to fix MongoServerError Code 28
  // First remove the corrupted field entirely
  await User.collection.updateOne(
    { _id: new (require('mongoose').Types.ObjectId)(req.user.id), profileImage: "" },
    { $unset: { profileImage: "" } }
  );

  const user = await User.findById(req.user.id);

  // If this is set as default, unset other defaults
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully.',
    data: user.addresses,
  });
};

/**
 * @desc    Update user address
 * @route   PUT /api/auth/addresses/:addressId
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  // Temporary migration to fix MongoServerError Code 28
  await User.collection.updateOne(
    { _id: new (require('mongoose').Types.ObjectId)(req.user.id), profileImage: "" },
    { $unset: { profileImage: "" } }
  );

  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found.', 404));
  }

  // If setting as default, unset others
  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully.',
    data: user.addresses,
  });
};

/**
 * @desc    Delete user address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  // Temporary migration to fix MongoServerError Code 28
  await User.collection.updateOne(
    { _id: new (require('mongoose').Types.ObjectId)(req.user.id), profileImage: "" },
    { $unset: { profileImage: "" } }
  );

  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found.', 404));
  }

  address.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully.',
    data: user.addresses,
  });
};

module.exports = {
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
};
