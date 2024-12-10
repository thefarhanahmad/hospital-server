const express = require('express');
const packageController = require('../controllers/packageController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { packageValidation } = require('../validations/packageValidation');

const router = express.Router();

// Public routes
router.get('/user', packageController.getUserPackages);
router.get('/vendor', packageController.getVendorPackages);

// Admin only routes
router.use(protect);
router.use(restrictTo('admin'));

router.post(
  '/user',
  validateRequest(packageValidation),
  packageController.createUserPackage
);

router.post(
  '/vendor',
  validateRequest(packageValidation),
  packageController.createVendorPackage
);

module.exports = router;