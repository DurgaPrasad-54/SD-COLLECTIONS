const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = async (req, res, next) => {
  const { name, description } = req.body;

  let image = { url: '', publicId: '' };
  if (req.file) {
    image = await uploadImage(req.file.buffer, 'categories');
  }

  const category = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    data: category,
  });
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  const categories = await Category.find().sort('name');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

/**
 * @desc    Get category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const category = await Category.findOne(query);

  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res, next) => {
  const updateData = { ...req.body };

  if (req.file) {
    const existingCategory = await Category.findById(req.params.id);
    if (existingCategory && existingCategory.image && existingCategory.image.publicId) {
      await deleteImage(existingCategory.image.publicId);
    }
    updateData.image = await uploadImage(req.file.buffer, 'categories');
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    data: category,
  });
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  // Check if products exist in this category
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return next(
      new AppError(
        `Cannot delete category. ${productCount} product(s) belong to this category.`,
        400
      )
    );
  }

  if (category.image && category.image.publicId) {
    await deleteImage(category.image.publicId);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
  });
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
