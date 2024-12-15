const express = require("express");
const diagnosticController = require("../controllers/diagnosticController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  testValidation,
  reportValidation,
} = require("../validations/diagnosticValidation");
const upload = require("../config/multer");
const router = express.Router();

// Protected routes
router.use(protect);
router.use(restrictTo("diagnostic"));

// Test Rates and Discounts
router.post(
  "/test-rates/:id?",
  validateRequest(testValidation),
  diagnosticController.addOrUpdateTest
);

router.get("/tests", diagnosticController.getTests);

// Report Management
router.post(
  "/report",
  upload.array("images"),
  validateRequest(reportValidation),
  diagnosticController.createReport
);

router.get("/reports", diagnosticController.getReports);

module.exports = router;
