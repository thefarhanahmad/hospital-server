const { body } = require('express-validator');

exports.testValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Test name is required'),
  
  body('category')
    .isIn(['radiology', 'imaging', 'cardiology', 'neurology', 'other'])
    .withMessage('Invalid test category'),
  
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
  
  body('turnaroundTime.value')
    .isInt({ min: 1 })
    .withMessage('Turnaround time must be a positive number'),
  
  body('turnaroundTime.unit')
    .isIn(['hours', 'days'])
    .withMessage('Invalid time unit')
];

exports.reportValidation = [
  body('test')
    .notEmpty()
    .withMessage('Test ID is required'),
  
  body('patient')
    .notEmpty()
    .withMessage('Patient ID is required'),
  
  body('performedAt')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('findings.description')
    .notEmpty()
    .withMessage('Findings description is required'),
  
  body('findings.observations')
    .isArray()
    .withMessage('Observations must be an array'),
  
  body('conclusion')
    .notEmpty()
    .withMessage('Conclusion is required'),
  
  body('radiologist')
    .notEmpty()
    .withMessage('Radiologist ID is required')
];