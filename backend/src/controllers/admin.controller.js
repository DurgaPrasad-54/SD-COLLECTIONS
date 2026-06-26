const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenueResult] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  // Order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      orderStatusBreakdown,
      recentOrders,
    },
  });
};

/**
 * @desc    Get monthly sales analytics
 * @route   GET /api/admin/analytics/sales
 * @access  Admin
 */
const getSalesAnalytics = async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  const monthlySales = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill missing months with 0
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const salesData = months.map((month, index) => {
    const found = monthlySales.find((s) => s._id === index + 1);
    return {
      month,
      totalSales: found ? Math.round(found.totalSales * 100) / 100 : 0,
      totalOrders: found ? found.totalOrders : 0,
    };
  });

  // Daily sales for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const dailySales = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Paid',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      year,
      monthlySales: salesData,
      dailySales,
    },
  });
};

/**
 * @desc    Get low stock products
 * @route   GET /api/admin/products/low-stock
 * @access  Admin
 */
const getLowStockProducts = async (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 10;

  const products = await Product.find({ stock: { $lte: threshold } })
    .populate('category', 'name')
    .sort('stock')
    .select('name slug stock price images category');

  res.status(200).json({
    success: true,
    count: products.length,
    threshold,
    data: products,
  });
};

/**
 * @desc    Get top selling products
 * @route   GET /api/admin/analytics/top-products
 * @access  Admin
 */
const getTopSellingProducts = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topProducts = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        slug: '$product.slug',
        image: { $arrayElemAt: ['$product.images', 0] },
        totalQuantity: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: topProducts.length,
    data: topProducts,
  });
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getLowStockProducts,
  getTopSellingProducts,
  getUsers,
};
