const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');
const { calculateTax, calculateShipping } = require('../utils/helpers');
const { sendOrderConfirmation } = require('../services/email.service');

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Private
 */
const placeOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('No items in order.', 400));
  }

  // Build order items with product validation
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Product not found: ${item.product}`, 404));
    }
    if (product.stock < item.quantity) {
      return next(
        new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 400)
      );
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images.length > 0 ? product.images[0].url : '',
      quantity: item.quantity,
      price: effectivePrice,
      size: item.size || '',
      color: item.color || '',
    });

    subtotal += effectivePrice * item.quantity;
  }

  // Calculate charges
  const tax = calculateTax(subtotal);
  const shippingCharge = calculateShipping(subtotal);
  let discount = 0;
  let appliedCoupon = '';

  // Apply coupon if provided
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      active: true,
      expiryDate: { $gt: new Date() },
    });

    if (coupon) {
      if (subtotal >= coupon.minOrderAmount) {
        if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else {
            discount = coupon.discountValue;
          }
          appliedCoupon = coupon.code;

          // Increment usage count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }
  }

  const totalAmount = Math.round((subtotal + tax + shippingCharge - discount) * 100) / 100;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    tax,
    shippingCharge,
    discount,
    couponCode: appliedCoupon,
    totalAmount,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
    orderStatus: 'Pending',
  });

  // Reduce stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear user's cart
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], totalPrice: 0 });

  // Send order confirmation email (non-blocking)
  const user = req.user;
  sendOrderConfirmation(order, user);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    user: req.user.id,
    $or: [
      { paymentMethod: 'COD' },
      { paymentStatus: { $in: ['Paid', 'Refunded'] } }
    ]
  };

  const orders = await Order.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Users can only see their own orders (admin can see all)
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order.', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Admin
 */
const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Optional filters
  const filter = {
    $or: [
      { paymentMethod: 'COD' },
      { paymentStatus: { $in: ['Paid', 'Refunded'] } }
    ]
  };
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
    delete filter.$or;
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res, next) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Validate status transitions
  const validTransitions = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Packed', 'Cancelled'],
    Packed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };

  if (!validTransitions[order.orderStatus].includes(orderStatus)) {
    return next(
      new AppError(
        `Cannot transition from '${order.orderStatus}' to '${orderStatus}'.`,
        400
      )
    );
  }

  order.orderStatus = orderStatus;

  if (orderStatus === 'Delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }
  }

  if (orderStatus === 'Cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = req.body.cancelReason || 'Cancelled by admin';

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // Refund if already paid
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refunded';
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to '${orderStatus}'.`,
    data: order,
  });
};

/**
 * @desc    Cancel order (User)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Only the order owner or admin can cancel
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to cancel this order.', 403));
  }

  // Only pending/confirmed orders can be cancelled by user
  if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
    return next(new AppError('This order cannot be cancelled at this stage.', 400));
  }

  order.orderStatus = 'Cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by user';

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  if (order.paymentStatus === 'Paid') {
    order.paymentStatus = 'Refunded';
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully.',
    data: order,
  });
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
