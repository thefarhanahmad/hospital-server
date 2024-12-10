const express = require("express");
const pharmacyController = require("../controllers/pharmacyController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  inventoryUpdateRules,
  billCreationRules,
} = require("../validations/pharmacyValidation");

const router = express.Router();

// Protected routes
router.use(protect);
router.use(restrictTo("pharmacy"));

router.get("/inventory", pharmacyController.getInventory);
router.post(
  "/inventory",
  validateRequest(inventoryUpdateRules),
  pharmacyController.updateInventory
);

router.post(
  "/billing",
  validateRequest(billCreationRules),
  pharmacyController.createBill
);
router.get("/bills", pharmacyController.getBills);

module.exports = router;
