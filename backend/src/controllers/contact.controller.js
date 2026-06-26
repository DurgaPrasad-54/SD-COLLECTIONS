const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');

/**
 * @desc    Submit a contact form message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactForm = async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return next(new AppError('Please provide name, email, and message', 400));
  }

  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    data: contact,
    message: 'Message sent successfully',
  });
};

/**
 * @desc    Get all contact messages
 * @route   GET /api/contact
 * @access  Private/Admin
 */
const getContacts = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const total = await Contact.countDocuments();
  const contacts = await Contact.find()
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: contacts.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: contacts,
  });
};

/**
 * @desc    Mark contact message as read
 * @route   PUT /api/contact/:id/read
 * @access  Private/Admin
 */
const markAsRead = async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError(`Contact message not found with id of ${req.params.id}`, 404));
  }

  contact.isRead = true;
  await contact.save();

  res.status(200).json({
    success: true,
    data: contact,
  });
};

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
const deleteContact = async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError(`Contact message not found with id of ${req.params.id}`, 404));
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
};

module.exports = {
  submitContactForm,
  getContacts,
  markAsRead,
  deleteContact,
};
