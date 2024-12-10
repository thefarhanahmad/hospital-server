const { body } = require('express-validator');

exports.subscriptionValidation = [
  body('packageId')
    .notEmpty()
    .withMessage('Package ID is required'),
  
  body('billingCycle')
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid billing cycle')
];

exports.usageValidation = [
  body('type')
    .isIn(['appointments', 'orders', 'reports', 'storage'])
    .withMessage('Invalid usage type'),
  
  body('increment')
    .isInt({ min: 1 })
    .withMessage('Increment must be a positive number')
];