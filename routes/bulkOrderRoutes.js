const express = require("express");
const bulkOrderController = require("../controllers/bulkOrderController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const { bulkOrderValidation } = require("../validations/bulkOrderValidation");

const router = express.Router();

// Protected routes
router.use(protect);

// Hospital bulk medicine orders
router.post(
  "/medicine",
  restrictTo("hospital"),
  validateRequest(bulkOrderValidation),
  bulkOrderController.createBulkMedicineOrder
);

// Pathology lab reagent orders

router.post(
  "/reagents",
  restrictTo("pathlab"),
  validateRequest(bulkOrderValidation),
  bulkOrderController.createBulkReagentOrder
);

router.post(
  "/supplies",
  restrictTo("diagnostic"),
  validateRequest(bulkOrderValidation),
  bulkOrderController.createBulkSupplyOrder
);

// Get all bulk orders
router.get(
  "/",
  restrictTo("hospital", "pathlab", "diagnostic"),
  bulkOrderController.getBulkOrders
);

module.exports = router;
