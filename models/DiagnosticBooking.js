const mongoose = require("mongoose");

const diagnosticBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diagnostic",
      required: true,
    },
    tests: [
      {
        test: {
          name: { type: String, required: true },
          price: { type: Number, required: true, min: 0 }, // Enforcing non-negative price
        },
        instructions: { type: String, required: false },
      },
    ],
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    sampleCollection: {
      type: String,
      enum: ["home", "center"],
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "pending",
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    report: {
      url: String,
      uploadedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DiagnosticBooking", diagnosticBookingSchema);
