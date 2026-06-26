const cloudinary = require('cloudinary').v2;
const config = require('../config');
const AppError = require('../utils/AppError');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer to upload
 * @param {String} folder - The destination folder in Cloudinary
 * @returns {Promise<Object>} - Resolves with { url, publicId }
 */
const uploadImage = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new AppError('Failed to upload image to Cloudinary', 500));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its public_id
 * @param {String} publicId - The public ID of the image
 * @returns {Promise<void>}
 */
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Not throwing an error here so that deletion flow continues even if Cloudinary fails
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
