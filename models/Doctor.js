const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      enum: [
        "General Practitioner",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Gynecologist",
        "Orthopedist",
        "Neurologist",
        "Psychiatrist",
        "Endocrinologist",
        "Ophthalmologist",
        "ENT Specialist",
        "Dentist",
        "Oncologist",
        "Gastroenterologist",
        "Pulmonologist",
        "Nephrologist",
        "Urologist",
        "Rheumatologist",
        "Hematologist",
        "Surgeon",
        "Plastic Surgeon",
        "Radiologist",
        "Anesthesiologist",
        "Physiotherapist",
        "Psychologist",
        "Dietitian",
        "Immunologist",
        "Sexologist",
        "Infectious Disease Specialist",
        "Sports Medicine Specialist",
      ],
      required: true,
    },
    fees:{type: Number, required: [true,'Consult fees is require']},
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
        type: [String],
        default: [],
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
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
