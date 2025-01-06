const express = require("express");
const bloodBankController = require("../controllers/bloodBankController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  inventoryValidation,
  requestStatusValidation,
} = require("../validations/bloodBankValidation");

const router = express.Router();
// Billing
router.post("/billing/:requestId", bloodBankController.generateBill);
// Protected routes
router.use(protect);
router.use(restrictTo("bloodbank"));
router.post("/create-blood-bank", bloodBankController.createBloodBank);

// Inventory Management

router.post(
  "/inventory",
  validateRequest(inventoryValidation),
  bloodBankController.updateInventory
);
router.get("/availability", bloodBankController.getAvailability);
// Blood Request Management
router.post("/requests", bloodBankController.createBloodRequest);
router.get("/requests", bloodBankController.getBloodRequests);
router.patch(
  "/requests/:requestId",
  validateRequest(requestStatusValidation),
  bloodBankController.updateRequestStatus
);

// Admin only routes

module.exports = router;
