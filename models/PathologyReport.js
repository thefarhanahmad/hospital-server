const mongoose = require("mongoose");

const pathologyReportSchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyTest",
      required: true,
    },
    sampleCollectedAt: {
      type: Date,
      required: true,
    },
    reportGeneratedAt: Date,
    results: [
      {
        parameter: String,
        value: Number,
        unit: String,
        referenceRange: {
          min: Number,
          max: Number,
        },
        interpretation: String,
        flag: {
          type: String,
          enum: ["normal", "low", "high", "critical"],
        },
      },
    ],
    interpretation: String,
    remarks: String,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportUrl: String,
  },
  {
    timestamps: true,
  }
);

const PathologyReport = mongoose.model(
  "PathologyReport",
  pathologyReportSchema
);

module.exports = PathologyReport;
