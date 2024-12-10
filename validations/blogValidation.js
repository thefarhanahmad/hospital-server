const { body } = require('express-validator');

exports.blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Blog content is required'),
  
  body('category')
    .isIn(['health', 'wellness', 'medical', 'lifestyle', 'news'])
    .withMessage('Invalid blog category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      return true;
    }),
  
  body('featuredImage.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid blog status'),
  
  body('meta.description')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
  
  body('meta.keywords')
    .optional()
    .isArray()
    .withMessage('Meta keywords must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Cannot have more than 10 meta keywords');
      }
      return true;
    })
];