const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Virtual: Check if coupon is valid ────────────────
couponSchema.virtual('isValid').get(function () {
  const notExpired = this.expiryDate > new Date();
  const notExhausted = this.usageLimit === null || this.usedCount < this.usageLimit;
  return this.active && notExpired && notExhausted;
});

// Ensure virtuals are included in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

couponSchema.index({ expiryDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
