const { body } = require('express-validator');

exports.inventoryValidation = [
  body('bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  
  body('component')
    .isIn(['whole', 'plasma', 'platelets', 'rbc'])
    .withMessage('Invalid blood component'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('collectionDate')
    .isISO8601()
    .withMessage('Invalid collection date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Collection date cannot be in the future');
      }
      return true;
    }),
  
  body('expiryDate')
    .isISO8601()
    .withMessage('Invalid expiry date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.collectionDate)) {
        throw new Error('Expiry date must be after collection date');
      }
      return true;
    }),
  
  body('storageLocation')
    .notEmpty()
    .withMessage('Storage location is required')
];

exports.requestStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Invalid status')
];