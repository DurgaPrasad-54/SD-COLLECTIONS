const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    image: {
      url: { type: String, required: [true, 'Banner image URL is required'] },
      publicId: { type: String, default: '' },
    },
    redirectUrl: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ active: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
