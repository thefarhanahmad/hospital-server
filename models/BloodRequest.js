const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    patient: {
      name: String,
      age: Number,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: true,
      },
    },
    component: {
      type: String,
      enum: ["whole", "plasma", "platelets", "rbc"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected"],
      default: "pending",
    },
    requiredBy: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    billing: {
      amount: Number,
      paid: {
        type: Boolean,
        default: false,
      },
      transactionId: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
