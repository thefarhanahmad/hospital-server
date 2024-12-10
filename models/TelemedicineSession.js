const mongoose = require("mongoose");

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    meetingLink: String,
    technicalIssues: [
      {
        issue: String,
        timestamp: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TelemedicineSession",
  telemedicineSessionSchema
);
