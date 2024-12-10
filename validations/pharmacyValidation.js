const { body } = require("express-validator");

exports.inventoryUpdateRules = [
  body("medicineId").notEmpty().withMessage("Medicine ID is required"),

  body("batchNumber").notEmpty().withMessage("Batch number is required"),

  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive number"),

  body("expiryDate")
    .isISO8601()
    .withMessage("Invalid expiry date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),

  body("purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),

  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number")
    .custom((value, { req }) => {
      if (value < req.body.purchasePrice) {
        throw new Error("Selling price cannot be less than purchase price");
      }
      return true;
    }),
];

exports.billCreationRules = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.inventory").notEmpty().withMessage("Inventory ID is required"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("paymentMethod")
    .isIn(["cash", "card", "upi", "other"])
    .withMessage("Invalid payment method"),
];
