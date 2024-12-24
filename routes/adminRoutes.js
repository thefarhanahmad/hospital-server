const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");
const { packageValidation } = require("../validations/packageValidation");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();
router.use(protect);

router.use(restrictTo("admin"));

router.get("/all-hospitals", adminController.getAllHospital);
router.get("/all-pharmacy", adminController.getAllPharmacy);
router.get("/all-pathology", adminController.getAllPathology);
router.get("/all-diagnostic", adminController.getAllDiagnostic);
router.get("/all-equipment", adminController.getAllEquipment);
router.get("/all-doctors", adminController.getAllDoctors);
router.get("/all-patient", adminController.getAllPatient);
router.get("/all-appointments", adminController.getAllAppointments);
router.get("/all-medicines", adminController.getAllMedicines);
router.get("/all-badInventries", adminController.getAllbadInventries);
router.get("/all-bloodInventries", adminController.getAllbloodInventries);
router.get(
  "/all-pathologyInventries",
  adminController.getAllPathologyInventries
);
router.get("/all-users", adminController.getAllUsers);
router.post("/create-user", adminController.createUser);
router.delete("/delete-user/:id", adminController.deleteUser);
router.patch("/update-user/:id", adminController.updateUser);

router.post(
  "/create-package",
  validateRequest(packageValidation),
  adminController.createUserPackage
);
router.get("/get-package", adminController.getUserPackages);

module.exports = router;
