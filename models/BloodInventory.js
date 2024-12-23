const mongoose = require("mongoose");

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    component: {
      type: String,
      enum: ["whole", "plasma", "platelets", "rbc"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "discarded"],
      default: "available",
    },
    storageLocation: {
      unit: String,
      shelf: String,
      container: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
bloodInventorySchema.index({
  bloodBank: 1,
  bloodType: 1,
  component: 1,
  status: 1,
});

module.exports = mongoose.model("BloodInventory", bloodInventorySchema);
