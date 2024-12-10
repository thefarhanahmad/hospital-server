const express = require("express");
const authController = require("../controllers/authController");
const { validateRequest } = require("../middleware/validateRequest");
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

module.exports = router;
