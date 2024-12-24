const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    registrationNumber: { type: String, required: true, unique: true },
    clinicName: { type: String, required: true, trim: true },
    verification: { type: Boolean, default: false },
    degree: { type: String, required: true },
    aadharCardNumber: { type: String, required: true, unique: true },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    documents: {
      educationalQualifications: {
        tenthMarksheet: { type: String },
        twelfthMarksheet: { type: String },
      },
      medicalDegreeDocuments: {
        degreeCertificate: { type: String, required: true },
        academicYearMarksheets: [
          {
            year: String,
            filePath: String,
          },
        ],
      },
      photograph: { type: String },
      mciRegistration: {
        type: [String], // Array of file paths
        default: [], // Default to an empty array
      },
    },
    clinics: [
      {
        clinicName: { type: String, required: true },
        location: {
          address: { type: String, required: true },
          latitude: { type: Number },
          longitude: { type: Number },
        },
        clinicPhotos: [{ type: String }],
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
