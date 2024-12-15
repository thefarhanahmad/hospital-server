const { body, param } = require("express-validator");

exports.hospitalRegistrationRules = [
  body("name").trim().notEmpty().withMessage("Hospital name is required"),

  body("type").isIn(["public", "private"]).withMessage("Invalid hospital type"),

  body("cmoNumber")
    .optional()
    .trim()
    .isString()
    .withMessage("CMO Number must be a string"),

  body("hospitalImages")
    .isArray({ min: 1 })
    .withMessage("Hospital images must be an array with at least one image"),
  body("hospitalImages.*")
    .isString()
    .withMessage("Each hospital image must be a string"),

  body("insuranceServices.tps")
    .optional()
    .isArray()
    .withMessage("TPS must be an array"),
  body("insuranceServices.tps.*")
    .isIn(["Max", "HDFC Ergo", "Kotak Health"])
    .withMessage("Invalid TPS value"),

  body("insuranceServices.ayushmanBharat.enabled")
    .optional()
    .isBoolean()
    .withMessage("Ayushman Bharat 'enabled' must be a boolean"),
  body("insuranceServices.ayushmanBharat.specialties")
    .optional()
    .isArray()
    .withMessage("Specialties must be an array"),
  body("insuranceServices.ayushmanBharat.specialties.*")
    .isIn(["Pediatrics", "Gynecology", "Orthopedics"])
    .withMessage("Invalid specialty"),
  body("insuranceServices.ayushmanBharat.beds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Beds must be a positive integer"),

  body("ownershipInformation.enabled")
    .optional()
    .isBoolean()
    .withMessage("Ownership information 'enabled' must be a boolean"),
  body("ownershipInformation.ownershipType")
    .optional()
    .isIn([
      "Trust",
      "Society",
      "Company",
      "Partnership Deed",
      "Individual",
      "Custom",
    ])
    .withMessage("Invalid ownership type"),
  body("ownershipInformation.customDetails")
    .optional()
    .isString()
    .withMessage("Custom details must be a string"),

  body("registrationBasis")
    .optional()
    .isIn([
      "Trust",
      "Society",
      "Company",
      "Partnership Deed",
      "Individual",
      "Custom",
    ])
    .withMessage("Invalid registration basis"),

  body("chargesOverview")
    .isArray()
    .withMessage("Charges overview must be an array"),
  body("chargesOverview.*.chargeName")
    .notEmpty()
    .withMessage("Charge name is required"),
  body("chargesOverview.*.timing").notEmpty().withMessage("Timing is required"),
  body("chargesOverview.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("doctorAvailability.availableDoctors")
    .isArray()
    .withMessage("Available doctors must be an array"),
  body("doctorAvailability.availableDoctors.*.name")
    .notEmpty()
    .withMessage("Doctor name is required"),
  body("doctorAvailability.availableDoctors.*.status")
    .isIn(["available", "not-available"])
    .withMessage("Invalid status"),
  body("doctorAvailability.onCallDoctors")
    .optional()
    .isInt({ min: 0 })
    .withMessage("On-call doctors must be a positive integer"),
  body("doctorAvailability.permanentDoctors")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Permanent doctors must be a positive integer"),
  body("doctorAvailability.doctorDutyTimings")
    .optional()
    .isArray()
    .withMessage("Doctor duty timings must be an array"),
  body("doctorAvailability.doctorDutyTimings.*.shift.start")
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Shift start time must be in HH:MM format"),
  body("doctorAvailability.doctorDutyTimings.*.shift.end")
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage("Shift end time must be in HH:MM format"),
];
exports.admissionRules = [
  body("hospital")
    .notEmpty()
    .withMessage("Hospital ID is required")
    .isMongoId()
    .withMessage("Invalid Hospital ID format"),

  body("patient")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Invalid Patient ID format"),

  body("bedInventory")
    .notEmpty()
    .withMessage("Bed Inventory ID is required")
    .isMongoId()
    .withMessage("Invalid Bed Inventory ID format"),

  body("admittedAt")
    .optional()
    .isISO8601()
    .withMessage("Admitted At must be a valid date in ISO 8601 format"),

  body("dischargedAt")
    .optional()
    .isISO8601()
    .withMessage("Discharged At must be a valid date in ISO 8601 format"),

  body("diagnosis")
    .optional()
    .isString()
    .withMessage("Diagnosis must be a string"),

  body("attendingDoctor")
    .notEmpty()
    .withMessage("Attending Doctor ID is required")
    .isMongoId()
    .withMessage("Invalid Doctor ID format"),

  body("status")
    .optional()
    .isIn(["admitted", "discharged"])
    .withMessage("Status must be either 'admitted' or 'discharged'"),

  body("billing.bedCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Bed Charges must be a positive number"),

  body("billing.medicationCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Medication Charges must be a positive number"),

  body("billing.consultationCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Consultation Charges must be a positive number"),

  body("billing.miscCharges")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Miscellaneous Charges must be a positive number"),

  body("billing.discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount must be a positive number"),

  body("billing.totalAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total Amount must be a positive number"),

  body("billing.paid")
    .optional()
    .isBoolean()
    .withMessage("Paid status must be a boolean"),
];
exports.bedStatusRules = [
  body("ward")
    .notEmpty()
    .withMessage("Ward is required")
    .isIn(["general", "private", "semi-private", "icu", "nicu", "emergency"])
    .withMessage("Invalid ward type"),

  body("totalBeds")
    .notEmpty()
    .withMessage("Total beds is required")
    .isInt({ min: 0 })
    .withMessage("Total beds must be a positive integer"),

  body("occupiedBeds")
    .notEmpty()
    .withMessage("Occupied beds is required")
    .isInt({ min: 0 })
    .withMessage("Occupied beds must be a positive integer"),
];
exports.dischargeRules = [
  // Validate the patient ID from the route parameter
  param("id")
    .notEmpty()
    .withMessage("Patient Addmission ID is required")
    .isMongoId()
    .withMessage("Invalid Patient Addmission ID format"),
];
