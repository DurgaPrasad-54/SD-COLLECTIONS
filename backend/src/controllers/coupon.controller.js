const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a coupon (Admin)
 * @route   POST /api/coupons
 * @access  Admin
 */
const createCoupon = async (req, res, next) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully.',
    data: coupon,
  });
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Admin
 */
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons,
  });
};

/**
 * @desc    Get coupon by ID (Admin)
 * @route   GET /api/coupons/:id
 * @access  Admin
 */
const getCouponById = async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
};

/**
 * @desc    Update coupon (Admin)
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
const updateCoupon = async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new AppError('Coupon not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully.',
    data: coupon,
  });
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
const deleteCoupon = async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found.', 404));
  }

  await Coupon.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully.',
  });
};

/**
 * @desc    Apply a coupon (User)
 * @route   POST /api/coupons/apply
 * @access  Private
 */
const applyCoupon = async (req, res, next) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (!coupon) {
    return next(new AppError('Invalid coupon code.', 404));
  }

  // Check if active
  if (!coupon.active) {
    return next(new AppError('This coupon is no longer active.', 400));
  }

  // Check expiry
  if (coupon.expiryDate < new Date()) {
    return next(new AppError('This coupon has expired.', 400));
  }

  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError('This coupon has reached its usage limit.', 400));
  }

  // Check minimum order amount
  if (orderAmount < coupon.minOrderAmount) {
    return next(
      new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.`, 400)
    );
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, orderAmount);
  discount = Math.round(discount * 100) / 100;

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully.',
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalAmount: Math.round((orderAmount - discount) * 100) / 100,
    },
  });
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
