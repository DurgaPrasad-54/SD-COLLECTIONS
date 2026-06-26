const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a review
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({ product: productId, user: req.user.id });
  if (existingReview) {
    return next(new AppError('You have already reviewed this product.', 400));
  }

  // Optional: Verify user has purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    orderStatus: 'Delivered',
  });

  if (!hasPurchased) {
    return next(new AppError('You can only review products you have purchased and received.', 400));
  }

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    rating,
    comment,
  });

  await review.populate('user', 'name profileImage');

  res.status(201).json({
    success: true,
    message: 'Review added successfully.',
    data: review,
  });
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  // Only the review author can update
  if (review.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this review.', 403));
  }

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment) review.comment = req.body.comment;

  await review.save();
  await review.populate('user', 'name profileImage');

  res.status(200).json({
    success: true,
    message: 'Review updated successfully.',
    data: review,
  });
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin
 */
const deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  // Only review author or admin can delete
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review.', 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
  });
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
const getProductReviews = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name profileImage')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ product: req.params.productId });

  // Rating breakdown
  const ratingBreakdown = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    ratingBreakdown,
    data: reviews,
  });
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
};
