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

router.post("/create-pharmacy",pharmacyController.createPharmacy)
router.post("/create-medicine", pharmacyController.createMedicine);
router.get("/all-medicine", pharmacyController.getMedicine);
router.post(
  "/inventory",
  validateRequest(inventoryUpdateRules),
  pharmacyController.createInventory
);
router.get("/inventory", pharmacyController.getInventory);

router.post(
  "/billing",
  validateRequest(billCreationRules),
  pharmacyController.createBill
);
router.get("/bills", pharmacyController.getBills);

module.exports = router;
