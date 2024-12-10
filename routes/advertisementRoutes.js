const express = require("express");
const advertisementController = require("../controllers/advertisementController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  advertisementValidation,
  statusUpdateValidation,
} = require("../validations/advertisementValidation");

const router = express.Router();

// Public routes
router.get("/", advertisementController.getAds);
router.post("/click/:id", advertisementController.trackClick);

// Protected routes
router.use(protect);

// Advertiser routes
router.post(
  "/",
  validateRequest(advertisementValidation),
  advertisementController.uploadAd
);
router.get("/my-ads", advertisementController.getAdvertiserAds);

// Admin only routes
router.patch(
  "/:id/status",
  restrictTo("admin"),
  validateRequest(statusUpdateValidation),
  advertisementController.updateAdStatus
);

module.exports = router;
