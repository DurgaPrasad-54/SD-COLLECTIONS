const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
  const productData = { ...req.body };

  // Handle specifications if sent as JSON string
  if (typeof productData.specifications === 'string') {
    try {
      productData.specifications = JSON.parse(productData.specifications);
    } catch (e) {
      productData.specifications = {};
    }
  }

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'products'));
    productData.images = await Promise.all(uploadPromises);
  }

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
};

/**
 * @desc    Get all products (with search, filter, sort, pagination)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  // Count total matching documents (before pagination)
  const countQuery = Product.find();
  const countFeatures = new APIFeatures(countQuery, req.query).search('name').filter();
  const totalProducts = await Product.countDocuments(countFeatures.query.getFilter());

  // Build query with all features
  const features = new APIFeatures(Product.find().populate('category', 'name slug'), req.query)
    .search('name')
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    success: true,
    count: products.length,
    total: totalProducts,
    page: features.page,
    pages: Math.ceil(totalProducts / features.limit),
    data: products,
  });
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const product = await Product.findOne(query).populate('category', 'name slug');

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  const updateData = { ...req.body };

  // Handle specifications
  if (typeof updateData.specifications === 'string') {
    try {
      updateData.specifications = JSON.parse(updateData.specifications);
    } catch (e) {
      delete updateData.specifications;
    }
  }

  // Handle image updates
  let finalImages = [];
  const existingProduct = await Product.findById(req.params.id);
  
  if (updateData.existingImages) {
    try {
      finalImages = JSON.parse(updateData.existingImages);
    } catch (e) {
      finalImages = [];
    }
    delete updateData.existingImages;
  }

  // Find which images were removed by comparing existingProduct.images with finalImages
  if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
    const retainedPublicIds = finalImages.map(img => img.publicId);
    const imagesToDelete = existingProduct.images.filter(img => !retainedPublicIds.includes(img.publicId));
    
    if (imagesToDelete.length > 0) {
      try {
        const deletePromises = imagesToDelete.map((img) => deleteImage(img.publicId));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error('Failed to delete some images from Cloudinary during update:', err);
      }
    }
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'products'));
    const newlyUploaded = await Promise.all(uploadPromises);
    finalImages = [...finalImages, ...newlyUploaded];
  }

  updateData.images = finalImages;

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  if (product.images && product.images.length > 0) {
    try {
      const deletePromises = product.images.map((img) => deleteImage(img.publicId));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Failed to delete some images from Cloudinary during product deletion:', err);
      // We log the error but still proceed with deleting the product document.
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
  });
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await Product.find({ isFeatured: true })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
};

/**
 * @desc    Upload product images
 * @route   POST /api/products/:id/images
 * @access  Admin
 */
const uploadProductImages = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image.', 400));
  }

  const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'products'));
  const newImages = await Promise.all(uploadPromises);

  product.images.push(...newImages);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully.',
    data: product,
  });
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
const getProductsByCategory = async (req, res) => {
  const features = new APIFeatures(
    Product.find({ category: req.params.categoryId }).populate('category', 'name slug'),
    req.query
  )
    .sort()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments({ category: req.params.categoryId });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit),
    data: products,
  });
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  uploadProductImages,
  getProductsByCategory,
};
