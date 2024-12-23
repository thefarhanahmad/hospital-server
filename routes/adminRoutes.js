const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.use(restrictTo("admin"));

router.get("/all-hospitals", adminController.getAllHospital);
router.get("/all-pharmacy", adminController.getAllPharmacy);
router.get("/all-doctors", adminController.getAllDoctors);
router.get("/all-patient", adminController.getAllPatient);
router.get("/all-appointments", adminController.getAllAppointments);
router.get("/all-medicines", adminController.getAllMedicines);
router.get("/all-badInventries", adminController.getAllbadInventries);
router.get("/all-bloodInventries", adminController.getAllbloodInventries);
router.get("/all-pathologyInventries", adminController.getAllPathologyInventries);
router.get("/all-users", adminController.getAllUsers);
router.post("/create-user", adminController.createUser);
router.delete("/delete-user/:id", adminController.deleteUser);
router.patch("/update-user/:id", adminController.updateUser);


module.exports = router;
