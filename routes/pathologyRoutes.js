const express = require("express");
const pathologyController = require("../controllers/pathologyController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  testValidation,
  reportValidation,
} = require("../validations/pathologyValidation");

const router = express.Router();

// Protected routes
router.use(protect);
router.use(restrictTo("pathlab"));
router.post("/create-pathology", pathologyController.createPathologyLab);
// Test Management
router.post(
  "/test",
  validateRequest(testValidation),
  pathologyController.addTest
);
router.get("/tests", pathologyController.getTests);

// Report Generation
router.post(
  "/report",
  validateRequest(reportValidation),
  pathologyController.generateReport
);
router.get("/reports", pathologyController.getReports);
router.post("/lab-category", pathologyController.addlabCategory);
router.get("/all-lab-category", pathologyController.getlabCategory);
// Inventory Management
router.post("/inventory", pathologyController.createInventory);
router.get("/inventory", pathologyController.getInventory);
router.post("/create-equipment", pathologyController.createEquipment);
router.get("/all-equipment", pathologyController.getAllEquipment);

module.exports = router;
