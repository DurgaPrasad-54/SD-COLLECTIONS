const Banner = require('../models/Banner');
const AppError = require('../utils/AppError');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');

/**
 * @desc    Create a banner
 * @route   POST /api/banners
 * @access  Admin
 */
const createBanner = async (req, res) => {
  const bannerData = { ...req.body };

  if (req.file) {
    bannerData.image = await uploadImage(req.file.buffer, 'banners');
  }

  const banner = await Banner.create(bannerData);

  res.status(201).json({
    success: true,
    message: 'Banner created successfully.',
    data: banner,
  });
};

/**
 * @desc    Get all banners (active only for users)
 * @route   GET /api/banners
 * @access  Public
 */
const getBanners = async (req, res) => {
  const filter = {};

  // Non-admin users see only active banners
  if (!req.user || req.user.role !== 'admin') {
    filter.active = true;
  }

  const banners = await Banner.find(filter).sort('order');

  res.status(200).json({
    success: true,
    count: banners.length,
    data: banners,
  });
};

/**
 * @desc    Update banner
 * @route   PUT /api/banners/:id
 * @access  Admin
 */
const updateBanner = async (req, res, next) => {
  const updateData = { ...req.body };

  if (req.file) {
    const existingBanner = await Banner.findById(req.params.id);
    if (existingBanner && existingBanner.image && existingBanner.image.publicId) {
      await deleteImage(existingBanner.image.publicId);
    }
    updateData.image = await uploadImage(req.file.buffer, 'banners');
  }

  const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    return next(new AppError('Banner not found.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Banner updated successfully.',
    data: banner,
  });
};

/**
 * @desc    Delete banner
 * @route   DELETE /api/banners/:id
 * @access  Admin
 */
const deleteBanner = async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found.', 404));
  }

  if (banner.image && banner.image.publicId) {
    await deleteImage(banner.image.publicId);
  }

  await Banner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Banner deleted successfully.',
  });
};

module.exports = {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
};
