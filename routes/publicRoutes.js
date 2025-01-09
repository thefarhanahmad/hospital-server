const express = require("express");
const {
  getAllPatients,
  getAllPriscriptions,
} = require("../controllers/publicControllers");

const router = express.Router();

// Public routes
router.get("/all-patients", getAllPatients);
router.get("/all-prescriptions", getAllPriscriptions);

module.exports = router;
