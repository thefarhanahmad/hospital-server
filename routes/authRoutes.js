const express = require("express");
const authController = require("../controllers/authController");
const { validateRequest } = require("../middleware/validateRequest");
const { protect } = require("../middleware/auth");
const {
  registerValidationRules,
  loginValidationRules,
} = require("../validations/authValidation");

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerValidationRules),
  authController.register
);

router.post(
  "/login",
  validateRequest(loginValidationRules),
  authController.login
);

router.post("/addresses", protect, authController.addAddress);
router.get("/addresses", protect, authController.getAddresses);
router.delete("/addresses/:address_id", protect, authController.deleteAddress);

module.exports = router;
