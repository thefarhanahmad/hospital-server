const { body } = require('express-validator');

exports.bulkOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.item')
    .notEmpty()
    .withMessage('Item ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('items.*.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  
  body('supplier')
    .notEmpty()
    .withMessage('Supplier ID is required'),
  
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required'),
  
  body('expectedDeliveryDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expected delivery date must be in the future');
      }
      return true;
    }),
  
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  
  body('paymentTerms')
    .optional()
    .isString()
    .withMessage('Payment terms must be a string')
];