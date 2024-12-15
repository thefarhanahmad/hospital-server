const express = require("express");
const hospitalController = require("../controllers/hospitalController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  bedStatusRules,
  admissionRules,
  dischargeRules,
} = require("../validations/hospitalValidation");
const upload = require("../config/multer");

const router = express.Router();

const uploadFields = [{ name: "hospitalImages", maxCount: 10 }];
router.post(
  "/register",
  upload.fields(uploadFields),
  hospitalController.registerHospital
);

// Protected routes
router.use(protect);
router.use(restrictTo("hospital"));

router.get("/bed-status", hospitalController.getBedStatus);
router.put(
  "/bed-status",
  validateRequest(bedStatusRules),
  hospitalController.updateBedStatus
);
router.post(
  "/createbad",hospitalController.createBed);

router.post(
  "/admission",
  validateRequest(admissionRules),
  hospitalController.admitPatient
);

router.put(
  "/discharge/:id",
  validateRequest(dischargeRules),
  hospitalController.dischargePatient
);

// Admin only routes
router.patch(
  "/:id/verification",
  restrictTo("admin"),
  hospitalController.verifyHospital
);

module.exports = router;
