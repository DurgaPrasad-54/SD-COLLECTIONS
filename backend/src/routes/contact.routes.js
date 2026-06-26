const express = require('express');
const {
  submitContactForm,
  getContacts,
  markAsRead,
  deleteContact,
} = require('../controllers/contact.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(submitContactForm)
  .get(authenticate, authorize('admin'), getContacts);

router
  .route('/:id/read')
  .put(authenticate, authorize('admin'), markAsRead);

router
  .route('/:id')
  .delete(authenticate, authorize('admin'), deleteContact);

module.exports = router;
