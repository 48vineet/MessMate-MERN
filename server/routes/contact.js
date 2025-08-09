// routes/contact.js
const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');
const { body } = require('express-validator');

// Validation middleware
const contactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required')
];

// Public routes
router.post('/', contactValidation, sendContactEmail);

module.exports = router; 