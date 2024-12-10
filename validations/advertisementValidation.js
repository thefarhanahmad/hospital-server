const { body } = require('express-validator');

exports.advertisementValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Advertisement title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Advertisement description is required'),
  
  body('imageUrl')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('targetUrl')
    .trim()
    .notEmpty()
    .withMessage('Target URL is required')
    .isURL()
    .withMessage('Invalid target URL'),
  
  body('type')
    .isIn(['banner', 'popup', 'sidebar'])
    .withMessage('Invalid advertisement type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('targeting.locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array'),
  
  body('targeting.ageRange.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be a positive number'),
  
  body('targeting.ageRange.max')
    .optional()
    .isInt({ min: 0 })
    .custom((value, { req }) => {
      if (req.body.targeting?.ageRange?.min && value <= req.body.targeting.ageRange.min) {
        throw new Error('Maximum age must be greater than minimum age');
      }
      return true;
    }),
  
  body('targeting.gender')
    .optional()
    .isIn(['all', 'male', 'female'])
    .withMessage('Invalid gender targeting'),
  
  body('placement.pages')
    .optional()
    .isArray()
    .withMessage('Pages must be an array'),
  
  body('placement.position')
    .optional()
    .isString()
    .withMessage('Position must be a string'),
  
  body('placement.priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be a positive number')
];

exports.statusUpdateValidation = [
  body('status')
    .isIn(['active', 'inactive', 'pending', 'rejected'])
    .withMessage('Invalid status')
];