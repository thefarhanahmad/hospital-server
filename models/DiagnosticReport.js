const mongoose = require("mongoose");

const diagnosticReportSchema = new mongoose.Schema(
  {
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diagnostic",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiagnosticTest",
      required: true,
    },
    performedAt: {
      type: Date,
      required: true,
    },
    reportGeneratedAt: Date,
    findings: {
      description: String,
      observations: [String],
      impressions: [String],
    },

    conclusion: String,
    recommendations: [String],
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
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

module.exports = mongoose.model("DiagnosticReport", diagnosticReportSchema);
