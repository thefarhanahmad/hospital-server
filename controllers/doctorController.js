const Doctor = require("../models/Doctor");
const DoctorVerification = require("../models/DoctorVerification");
const Consultation = require("../models/Consultation");
const Prescription = require("../models/Prescription");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const Category = require("../models/doctorCategory");
const mongoose = require("mongoose");
const User = require("../models/User");
const fs = require("fs");
const doctorCategory = require("../models/doctorCategory");

exports.registerDoctor = catchAsync(async (req, res) => {
  console.log("doctor req body:", req.body);
  console.log("doctor req files:", req.files);

  const {
    name,
    registrationNumber,
    clinicName,
    degree,
    aadharCardNumber,
    mobileNumber,
    clinicLocation,
    latitude,
    longitude,
    email,
    category,
    status,
  } = req.body;

  try {
    // Check if the doctor already exists
    const existingDoctor = await Doctor.findOne({ "contactInfo.email": email });
    if (existingDoctor) {
      return res.status(400).json({
        status: "error",
        message: "A doctor is already registered with this email.",
      });
    }

    // Extract uploaded files
    const {
      tenthMarksheet,
      twelfthMarksheet,
      degreeCertificate,
      firstYearMarksheet,
      secondYearMarksheet,
      thirdYearMarksheet,
      fourthYearMarksheet,
      fifthYearMarksheet,
      mciRegistration,
      photograph,
      clinicPhotographs,
    } = req.files || {};

    // Prepare uploaded documents
    const uploadedDocuments = {
      educationalQualifications: {
        tenthMarksheet: tenthMarksheet?.[0]?.path || null,
        twelfthMarksheet: twelfthMarksheet?.[0]?.path || null,
      },
      medicalDegreeDocuments: {
        degreeCertificate: degreeCertificate?.[0]?.path || null,
        academicYearMarksheets: [
          {
            year: "First Year",
            filePath: firstYearMarksheet?.[0]?.path || null,
          },
          {
            year: "Second Year",
            filePath: secondYearMarksheet?.[0]?.path || null,
          },
          {
            year: "Third Year",
            filePath: thirdYearMarksheet?.[0]?.path || null,
          },
          {
            year: "Fourth Year",
            filePath: fourthYearMarksheet?.[0]?.path || null,
          },
          {
            year: "Fifth Year",
            filePath: fifthYearMarksheet?.[0]?.path || null,
          },
        ].filter((marksheet) => marksheet.filePath), // Remove empty entries
      },
      photograph: req.files.photograph?.[0].path || null,
      mciRegistration: mciRegistration?.map((file) => file.path) || [],
    };

    // Map clinic photos
    const clinicPhotos = clinicPhotographs?.map((file) => file.path) || [];

    // Create a new doctor object
    const doctorData = {
      userId: req.user?._id || null, 
      name,
      category,
      registrationNumber,
      clinicName,
      degree,
      aadharCardNumber,
      contactInfo: {
        phone: mobileNumber,
        email,
      },
      clinics: [
        {
          clinicName,
          location: {
            address: clinicLocation,
            latitude: parseFloat(latitude) || null,
            longitude: parseFloat(longitude) || null,
          },
          clinicPhotos,
        },
      ],
      documents: uploadedDocuments,
      status: status || "pending", // Default status
    };

    // Save doctor to the database
    const doctor = await Doctor.create(doctorData);

    res.status(201).json({
      status: "success",
      message: "Doctor registered successfully!",
      data: { doctor },
    });
  } catch (error) {
    console.error("Error in registerDoctor:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong during registration.",
      error: error.message,
    });
  }
});

exports.verifyDoctor = catchAsync(async (req, res, next) => {
  const verification = await DoctorVerification.findOne({
    doctor: req.params.id,
  });

  console.log("verification doctor : ", verification);
  console.log(req.params.id);

  if (!verification) {
    return next(new AppError("Verification record not found", 404));
  }

  verification.status = req.body.status;
  verification.remarks = req.body.remarks;
  verification.verifiedBy = req.user._id;
  await verification.save();

  res.status(200).json({
    status: "success",
    data: { verification },
  });
});

exports.createConsultation = catchAsync(async (req, res) => {
  const consultation = await Consultation.create({
    ...req.body,
    doctor: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { consultation },
  });
});

exports.getAppointments = catchAsync(async (req, res) => {
  const appointments = await Consultation.find({
    doctor: req.user._id,
    scheduledAt: { $gte: new Date() },
  })
    .populate("patient", "name email phone")
    .sort("scheduledAt");

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: { appointments },
  });
});

exports.createPrescription = catchAsync(async (req, res) => {
  const { patient, consultation } = req.body;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid patient ObjectId format",
    });
  }

  if (consultation && !mongoose.Types.ObjectId.isValid(consultation)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid consultation ObjectId format",
    });
  }

  // Convert valid ObjectId strings to ObjectId type
  const patientId = new mongoose.Types.ObjectId(patient);
  const consultationId = consultation
    ? new mongoose.Types.ObjectId(consultation)
    : null;

  // Create the prescription with valid ObjectIds
  const prescription = await Prescription.create({
    ...req.body,
    patient: patientId,
    consultation: consultationId,
    doctor: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { prescription },
  });
});

exports.getPrescriptions = catchAsync(async (req, res) => {
  const prescriptions = await Prescription.find({ doctor: req.user._id })
    .populate("patient", "name email")
    .populate("consultation")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: prescriptions.length,
    data: { prescriptions },
  });
});

exports.addCategory = catchAsync(async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await doctorCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    const category = new doctorCategory({ name });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding category",
      error: error.message,
    });
  }
});

exports.getAllDoctorCategory = catchAsync(async (req, res) => {
  const doctorCategories = await doctorCategory.find();
  res.status(200).json({
    status: "success",
    message: "All doctor categories retrieved successfully.",
    data: doctorCategories,
  });
});