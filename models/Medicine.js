const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    pharmacyId: {
       type: mongoose.Schema.ObjectId,
       ref: "User",
     },
   
    genericName: {
      type: String,
      required: [true, "Generic name is required"],
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, "Manufacturer name is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "drops",
        "other",
      ],
    },
    prescriptionRequired: {
      type: Boolean,
      default: true,
    },
    composition: [String],
    dosageForm: String,
    strength: String,
    packaging: String,
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Medicine", medicineSchema);
