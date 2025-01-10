const mongoose = require("mongoose");

// Pathology Test Schema
const pathologyTestSchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "LabId is required"],
    },
    name: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
    },
    category: {
      type: string,
      enum: [
        "Blood Tests",
        "Urine Tests",
        "Hormonal Tests",
        "Infection Tests",
        "Cancer Diagnosis",
        " Allergy Tests",
        "Genetic Tests",
        "Microbiological Tests",
        "Coagulation Tests",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    turnaroundTime: {
      value: {
        type: Number,
        required: [true, "Turnaround time is required"],
      },
      unit: {
        type: String,
        enum: ["hours", "days"],
        default: "days",
      },
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    sampleType: {
      type: String,
      required: [true, "Sample type is required"],
      enum: ["blood", "urine", "stool", "tissue", "other"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    referenceRanges: [
      {
        parameter: String,
        male: {
          min: Number,
          max: Number,
          unit: String,
        },
        female: {
          min: Number,
          max: Number,
          unit: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PathologyTest", pathologyTestSchema);
