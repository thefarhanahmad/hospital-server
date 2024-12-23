const mongoose = require("mongoose");

const pathologyInventorySchema = new mongoose.Schema(
  {
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,
        enum: ["reagent", "consumable", "equipment"],
        required: true,
      },
      manufacturer: String,
      unit: String,
    },
    batchNumber: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: Date,
    location: {
      room: String,
      shelf: String,
      position: String,
    },
    status: {
      type: String,
      enum: ["available", "low", "expired", "discontinued"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const PathologyInventory = mongoose.model(
  "PathologyInventory",
  pathologyInventorySchema
);

module.exports = PathologyInventory;
