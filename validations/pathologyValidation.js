const { body } = require('express-validator');

exports.testValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Test name is required'),
  
  body('category')
    .isIn(['hematology', 'biochemistry', 'microbiology', 'immunology', 'other'])
    .withMessage('Invalid test category'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('turnaroundTime.value')
    .isInt({ min: 1 })
    .withMessage('Turnaround time must be a positive number'),
  
  body('turnaroundTime.unit')
    .isIn(['hours', 'days'])
    .withMessage('Invalid time unit'),
  
  body('sampleType')
    .isIn(['blood', 'urine', 'stool', 'tissue', 'other'])
    .withMessage('Invalid sample type')
];

exports.reportValidation = [
  body('test')
    .notEmpty()
    .withMessage('Test ID is required'),
  
  body('patient')
    .notEmpty()
    .withMessage('Patient ID is required'),
  
  body('sampleCollectedAt')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('results')
    .isArray()
    .withMessage('Results must be an array'),
  
  body('results.*.parameter')
    .notEmpty()
    .withMessage('Parameter name is required'),
  
  body('results.*.value')
    .isNumeric()
    .withMessage('Result value must be a number'),
  
  body('results.*.unit')
    .notEmpty()
    .withMessage('Result unit is required')
];