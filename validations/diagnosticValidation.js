const { body } = require("express-validator");

exports.testValidation = [
  body("name").trim().notEmpty().withMessage("Test name is required"),

  body("category")
    .isIn(["radiology", "imaging", "cardiology", "neurology", "other"])
    .withMessage("Invalid test category"),

  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  body("turnaroundTime.value")
    .isInt({ min: 1 })
    .withMessage("Turnaround time must be a positive number"),

  body("turnaroundTime.unit")
    .isIn(["hours", "days"])
    .withMessage("Invalid time unit"),
];

// Helper function to parse JSON fields in form-data
const parseJSONField = (value, { req }) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    throw new Error("Invalid JSON format");
  }
};

exports.reportValidation = [
  body("test").notEmpty().withMessage("Test ID is required"),

  body("patient").notEmpty().withMessage("Patient ID is required"),

  body("performedAt").isISO8601().withMessage("Invalid date format"),

  body("conclusion").notEmpty().withMessage("Conclusion is required"),

  body("status")
    .isIn(["pending", "in-progress", "completed", "cancelled"])
    .withMessage("Invalid status value"),
];
