const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab",
    },
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
