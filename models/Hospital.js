const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["public", "private", "community"],
      // required: true,
      // default: "public",
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
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
      website: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    facilities: [
      {
        name: String,
        description: String,
        available: Boolean,
      },
    ],
    departments: [
      {
        name: String,
        head: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
        },
      },
    ],
    emergencyServices: {
      available: Boolean,
      contactNumber: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
