const { body } = require('express-validator');

exports.packageValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Package name is required'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Package description is required'),
  
  body('vendorType')
    .optional()
    .isIn(['doctor', 'hospital', 'pharmacy', 'diagnostic', 'pathlab', 'bloodbank'])
    .withMessage('Invalid vendor type'),
  
  body('price.monthly')
    .isFloat({ min: 0 })
    .withMessage('Monthly price must be a positive number'),
  
  body('price.yearly')
    .isFloat({ min: 0 })
    .withMessage('Yearly price must be a positive number')
    .custom((value, { req }) => {
      if (value >= req.body.price.monthly * 12) {
        throw new Error('Yearly price should offer a discount compared to monthly');
      }
      return true;
    }),
  
  body('features')
    .isArray()
    .withMessage('Features must be an array'),
  
  body('features.*.name')
    .notEmpty()
    .withMessage('Feature name is required'),
  
  body('limits.appointments')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Appointment limit must be a positive number'),
  
  body('limits.orders')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order limit must be a positive number'),
  
  body('limits.reports')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Report limit must be a positive number'),
  
  body('limits.storage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Storage limit must be a positive number')
];