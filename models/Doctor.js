const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
      },
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        slots: [
          {
            startTime: String,
            endTime: String,
          },
        ],
      },
    ],
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
