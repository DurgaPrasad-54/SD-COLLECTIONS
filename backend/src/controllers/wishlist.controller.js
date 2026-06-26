const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
    'products',
    'name slug images price discountPrice stock ratings'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  res.status(200).json({
    success: true,
    count: wishlist.products.length,
    data: wishlist,
  });
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, products: [] });
  }

  // Check if already in wishlist
  if (wishlist.products.includes(productId)) {
    return next(new AppError('Product already in wishlist.', 400));
  }

  wishlist.products.push(productId);
  await wishlist.save();

  await wishlist.populate('products', 'name slug images price discountPrice stock ratings');

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist.',
    data: wishlist,
  });
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return next(new AppError('Wishlist not found.', 404));
  }

  const index = wishlist.products.indexOf(req.params.productId);
  if (index === -1) {
    return next(new AppError('Product not in wishlist.', 404));
  }

  wishlist.products.splice(index, 1);
  await wishlist.save();

  await wishlist.populate('products', 'name slug images price discountPrice stock ratings');

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist.',
    data: wishlist,
  });
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
