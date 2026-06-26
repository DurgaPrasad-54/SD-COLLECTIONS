const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'name slug images price discountPrice stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [], totalPrice: 0 });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError(`Only ${product.stock} items available in stock.`, 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if product with same size and color already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (item.size || '') === size &&
      (item.color || '') === color
  );

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].price = effectivePrice;

    // Check stock
    if (cart.items[existingItemIndex].quantity > product.stock) {
      return next(new AppError(`Only ${product.stock} items available in stock.`, 400));
    }
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: effectivePrice,
      size,
      color,
    });
  }

  await cart.save();

  // Populate for response
  await cart.populate('items.product', 'name slug images price discountPrice stock');

  res.status(200).json({
    success: true,
    message: 'Item added to cart.',
    data: cart,
  });
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError('Quantity must be at least 1.', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Cart item not found.', 404));
  }

  // Check stock
  const product = await Product.findById(item.product);
  if (product && quantity > product.stock) {
    return next(new AppError(`Only ${product.stock} items available in stock.`, 400));
  }

  item.quantity = quantity;
  await cart.save();

  await cart.populate('items.product', 'name slug images price discountPrice stock');

  res.status(200).json({
    success: true,
    message: 'Cart updated.',
    data: cart,
  });
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found.', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Cart item not found.', 404));
  }

  item.deleteOne();
  await cart.save();

  await cart.populate('items.product', 'name slug images price discountPrice stock');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart.',
    data: cart,
  });
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared.',
    data: cart,
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
