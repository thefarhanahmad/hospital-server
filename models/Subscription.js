const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentHistory: [
      {
        amount: Number,
        paidAt: Date,
        transactionId: String,
        status: {
          type: String,
          enum: ["success", "failed", "refunded"],
        },
      },
    ],
    usage: {
      appointments: {
        used: { type: Number, default: 0 },
        limit: Number,
      },
      orders: {
        used: { type: Number, default: 0 },
        limit: Number,
      },
      reports: {
        used: { type: Number, default: 0 },
        limit: Number,
      },
      storage: {
        used: { type: Number, default: 0 }, // in GB
        limit: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
