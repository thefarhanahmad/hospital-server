const mongoose = require("mongoose");

// Pathology Test Schema
const pathologyTestSchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab", // Reference to the PathologyLab collection
      required: [true, "Lab is required"],
    },
    name: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "hematology",
        "biochemistry",
        "microbiology",
        "immunology",
        "other",
      ],
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
      // value: {
      //   type: Number,
      //   required: [true, "Turnaround time is required"],
      // },
      // unit: {
      type: String,
      required: [true, "TAT is required"],
      //   enum: ["hours", "days"],
      //   default: "days",
      // },
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
