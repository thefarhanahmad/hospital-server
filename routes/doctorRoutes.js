const express = require("express");
const doctorController = require("../controllers/doctorController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  doctorRegistrationRules,
  consultationRules,
  prescriptionRules,
} = require("../validations/doctorValidation");

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRequest(doctorRegistrationRules),
  doctorController.registerDoctor
);

// Protected routes
router.use(protect);
router.use(restrictTo("doctor"));

router.post(
  "/consultation",
  validateRequest(consultationRules),
  doctorController.createConsultation
);
router.get("/appointments", doctorController.getAppointments);
router.post(
  "/prescription",
  validateRequest(prescriptionRules),
  doctorController.createPrescription
);
router.get("/prescriptions", doctorController.getPrescriptions);

// Admin only routes
router.patch(
  "/:id/verification",
  restrictTo("admin"),
  doctorController.verifyDoctor
);

module.exports = router;
