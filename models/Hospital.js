const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    cmoNumber: {
      type: String,
      required: [true, "CMO number is required"],
    },
    hospitalImages: [
      {
        type: String,
        required: true,
      },
    ],
    insuranceServices: {
      tps: [
        {
          type: String,
          enum: ["Max", "HDFC Ergo", "Kotak Health"],
        },
      ],
      ayushmanBharat: {
        enabled: {
          type: Boolean,
          default: false,
        },
        specialties: [
          {
            type: String,
            enum: ["Pediatrics", "Gynecology", "Orthopedics"],
          },
        ],
        beds: {
          type: Number,
        },
      },
      cghs: {
        enabled: {
          type: Boolean,
          default: false,
        },
        specialties: [
          {
            type: String,
            enum: ["Pediatrics", "Gynecology", "Orthopedics"],
          },
        ],
        beds: {
          type: Number,
        },
      },
    },
    ownershipInformation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      ownershipType: {
        type: String,
        enum: [
          "Trust",
          "Society",
          "Company",
          "Partnership Deed",
          "Individual",
          "Custom",
        ],
      },
      customDetails: {
        type: String,
      },
    },
    registrationBasis: {
      type: String,
      enum: [
        "Trust",
        "Society",
        "Company",
        "Partnership Deed",
        "Individual",
        "Custom",
      ],
    },
    chargesOverview: [
      {
        chargeName: {
          type: String,
          required: true,
        },
        timing: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    doctorAvailability: {
      availableDoctors: [
        {
          name: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ["available", "not-available"],
            default: "not-available",
          },
        },
      ],
      onCallDoctors: {
        type: Number,
      },
      permanentDoctors: {
        type: Number,
      },
      doctorDutyTimings: [
        {
          doctorName: {
            type: String,
          },
          shift: {
            start: {
              type: String, // Time in HH:MM format
            },
            end: {
              type: String, // Time in HH:MM format
            },
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
