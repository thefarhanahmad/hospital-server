const { body } = require('express-validator');

exports.doctorRegistrationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required'),
  
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required'),
  
  body('experience')
    .isNumeric()
    .withMessage('Experience must be a number'),
  
  body('qualifications')
    .isArray()
    .withMessage('Qualifications must be an array'),
  
  body('qualifications.*.degree')
    .notEmpty()
    .withMessage('Degree is required'),
  
  body('documents')
    .isArray()
    .withMessage('Documents must be an array'),
  
  body('documents.*.type')
    .isIn(['degree', 'license', 'identity', 'other'])
    .withMessage('Invalid document type')
];

exports.consultationRules = [
  body('patient')
    .notEmpty()
    .withMessage('Patient ID is required'),
  
  body('type')
    .isIn(['audio', 'video', 'in-clinic'])
    .withMessage('Invalid consultation type'),
  
  body('scheduledAt')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('duration')
    .isInt({ min: 10, max: 60 })
    .withMessage('Duration must be between 10 and 60 minutes')
];

exports.prescriptionRules = [
  body('patient')
    .notEmpty()
    .withMessage('Patient ID is required'),
  
  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required'),
  
  body('medications')
    .isArray()
    .withMessage('Medications must be an array'),
  
  body('medications.*.name')
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.dosage')
    .notEmpty()
    .withMessage('Medication dosage is required')
];