const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Advertisement title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Advertisement description is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Advertisement image is required"],
    },
    targetUrl: {
      type: String,
      required: [true, "Target URL is required"],
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["banner", "popup", "sidebar"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targeting: {
      locations: [
        {
          type: String,
          trim: true,
        },
      ],
      ageRange: {
        min: Number,
        max: Number,
      },
      gender: {
        type: String,
        enum: ["all", "male", "female"],
      },
    },
    metrics: {
      impressions: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
    },
    placement: {
      pages: [String],
      position: String,
      priority: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
advertisementSchema.index({ status: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ "targeting.locations": 1 });

module.exports = mongoose.model("Advertisement", advertisementSchema);
