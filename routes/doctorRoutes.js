const express = require("express");
const doctorController = require("../controllers/doctorController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  doctorRegistrationRules,
  consultationRules,
  prescriptionRules,
} = require("../validations/doctorValidation");

const upload = require("../config/multer");
const router = express.Router();

// Define the fields to be uploaded
const uploadFields = [
  { name: "tenthMarksheet", maxCount: 1 },
  { name: "twelfthMarksheet", maxCount: 1 },
  { name: "degreeCertificate", maxCount: 1 },
  { name: "firstYearMarksheet", maxCount: 1 },
  { name: "secondYearMarksheet", maxCount: 1 },
  { name: "thirdYearMarksheet", maxCount: 1 },
  { name: "fourthYearMarksheet", maxCount: 1 },
  { name: "fifthYearMarksheet", maxCount: 1 },
  { name: "mciRegistration", maxCount: 1 }, 
  { name: "clinicPhotographs", maxCount: 10 }, 
];

router.post(
  "/register",
  upload.fields(uploadFields),
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