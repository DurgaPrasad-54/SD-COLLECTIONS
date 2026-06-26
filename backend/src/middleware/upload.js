const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// ─── Storage configuration ───────────────────────────
const storage = multer.memoryStorage();

// ─── File filter: images only ────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, jpg, png, gif, webp) are allowed.', 400), false);
  }
};

// ─── Multer instance ─────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// ─── Export helpers ──────────────────────────────────
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

module.exports = { upload, uploadSingle, uploadMultiple };
