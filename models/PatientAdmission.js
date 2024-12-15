const mongoose = require("mongoose");

const patientAdmissionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bedInventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BedInventory",
      required: true,
    },
    admittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dischargedAt: Date,
    diagnosis: String,
    attendingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    status: {
      type: String,
      enum: ["admitted", "discharged"],
      default: "admitted",
    },
    billing: {
      bedCharges: Number,
      medicationCharges: Number,
      consultationCharges: Number,
      miscCharges: Number,
      discount: Number,
      totalAmount: Number,
      paid: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PatientAdmission", patientAdmissionSchema);