const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { subscriptionValidation, usageValidation } = require('../validations/subscriptionValidation');

const router = express.Router();
router.use(protect);

router.post(
  '/',
  validateRequest(subscriptionValidation),
  subscriptionController.createSubscription
);

router.get('/current', subscriptionController.getCurrentSubscription);
router.patch('/cancel', subscriptionController.cancelSubscription);

router.patch(
  '/usage',
  validateRequest(usageValidation),
  subscriptionController.updateUsage
);

module.exports = router;