const mongoose = require("mongoose");

// Define the Bulk Order Schema
const bulkOrderSchema = new mongoose.Schema(
  {
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ordererType",
    },
    ordererType: {
      type: String,
      required: true,
      enum: ["Hospital", "PathologyLab", "Diagnostic"],
    },
    orderType: {
      type: String,
      required: true,
      enum: ["medicine", "reagent", "supply"],
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "orderType",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "supplierType",
    },
    supplierType: {
      type: String,
      required: true,
      enum: ["Pharmacy", "Supplier"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    expectedDeliveryDate: Date,
    subtotal: Number,
    tax: Number,
    discount: {
      type: Number,
      default: 0,
    },
    total: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "refunded"],
      default: "pending",
    },
    paymentTerms: String,
    remarks: String,
  },
  {
    timestamps: true,
  }
);

// Export the model
const BulkOrder = mongoose.model("BulkOrder", bulkOrderSchema);
module.exports = BulkOrder;
