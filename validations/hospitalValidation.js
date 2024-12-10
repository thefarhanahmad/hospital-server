const { body } = require("express-validator");

exports.hospitalRegistrationRules = [
  body("name").trim().notEmpty().withMessage("Hospital name is required"),

  body("type")
    .isIn(["public", "private", "community"])
    .withMessage("Invalid hospital type"),

  body("registrationNumber")
    .trim()
    .notEmpty()
    .withMessage("Registration number is required"),

  body("contactInfo.email")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("contactInfo.phone")
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),

  body("address").notEmpty().withMessage("Address is required"),

  body("documents").isArray().withMessage("Documents must be an array"),

  body("documents.*.type")
    .isIn(["license", "registration", "accreditation", "other"])
    .withMessage("Invalid document type"),
];

exports.bedStatusRules = [
  body("ward")
    .isIn(["general", "private", "semi-private", "icu", "nicu", "emergency"])
    .withMessage("Invalid ward type"),

  body("totalBeds")
    .isInt({ min: 0 })
    .withMessage("Total beds must be a positive number"),

  body("occupiedBeds")
    .isInt({ min: 0 })
    .withMessage("Occupied beds must be a positive number"),

  body("charges.base")
    .isFloat({ min: 0 })
    .withMessage("Base charges must be a positive number"),
];

exports.admissionRules = [
  body("patient").notEmpty().withMessage("Patient ID is required"),

  body("bedInventory").notEmpty().withMessage("Bed inventory ID is required"),

  body("attendingDoctor")
    .notEmpty()
    .withMessage("Attending doctor ID is required"),

  body("diagnosis").notEmpty().withMessage("Diagnosis is required"),
];

exports.dischargeRules = [
  body("billing.bedCharges")
    .isFloat({ min: 0 })
    .withMessage("Bed charges must be a positive number"),

  body("billing.totalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be a positive number"),
];
