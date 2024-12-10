const { body } = require('express-validator');

exports.appointmentRules = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor ID is required'),
  
  body('appointmentType')
    .isIn(['consultation', 'follow-up', 'emergency'])
    .withMessage('Invalid appointment type'),
  
  body('scheduledAt')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    })
];

exports.telemedicineRules = [
  body('sessionType')
    .isIn(['audio', 'video'])
    .withMessage('Invalid session type'),
  
  body('meetingLink')
    .isURL()
    .withMessage('Invalid meeting link')
];

exports.orderRules = [
  body('pharmacy')
    .notEmpty()
    .withMessage('Pharmacy ID is required'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.medicine')
    .notEmpty()
    .withMessage('Medicine ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required')
];

exports.testBookingRules = [
  body('center')
    .notEmpty()
    .withMessage('Diagnostic center ID is required'),
  
  body('tests')
    .isArray({ min: 1 })
    .withMessage('At least one test is required'),
  
  body('scheduledAt')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),
  
  body('sampleCollection')
    .isIn(['home', 'center'])
    .withMessage('Invalid sample collection type')
];