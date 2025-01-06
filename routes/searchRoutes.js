const express = require("express");
const searchController = require("../controllers/searchController");

const router = express.Router();

router.get("/location", searchController.getLiveLocation);
router.get("/medicine", searchController.searchMedicines);
router.get("/doctors", searchController.filterDoctorsByCategory);
router.get("/tests", searchController.searchLabTestsByName);
module.exports = router;