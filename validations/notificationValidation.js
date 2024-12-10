const { body } = require('express-validator');

exports.notificationValidation = [
  body('recipient')
    .optional()
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  
  body('type')
    .isIn(['appointment', 'test', 'prescription', 'payment', 'system'])
    .withMessage('Invalid notification type'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level')
];