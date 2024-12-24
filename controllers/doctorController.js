const Doctor = require("../models/Doctor");
const DoctorVerification = require("../models/DoctorVerification");
const Consultation = require("../models/Consultation");
const Prescription = require("../models/Prescription");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const User = require("../models/User");
const fs = require("fs");

exports.registerDoctor = catchAsync(async (req, res) => {
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
    status,
    email,
    category
  } = req.body;

  const existingDoctor = await Doctor.findOne({ "contactInfo.email": email });
  if (existingDoctor) {
    return res.status(400).json({
      status: "error",
      message: "User already exists with this email.",
    });
  }

  // Function to upload a single file to Cloudinary with retries
  const uploadToCloudinary = async (file, retries = 3) => {
    if (!file) return null;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "doctor_documents",
        });
        fs.unlinkSync(file.path); // Delete local file
        return result.secure_url;
      } catch (error) {
        console.error(`Cloudinary upload failed (attempt ${i + 1}):`, error);
        if (i === retries - 1)
          throw new Error("Failed to upload file to Cloudinary");
      }
    }
  };

  // Function to upload multiple files to Cloudinary
  const uploadMultipleToCloudinary = async (files) => {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map((file) => uploadToCloudinary(file));
    return Promise.all(uploadPromises);
  };

  try {
    const uploadedDocuments = {
      educationalQualifications: {
        tenthMarksheet: await uploadToCloudinary(req.files.tenthMarksheet?.[0]),
        twelfthMarksheet: await uploadToCloudinary(
          req.files.twelfthMarksheet?.[0]
        ),
      },
      medicalDegreeDocuments: {
        degreeCertificate: await uploadToCloudinary(
          req.files.degreeCertificate?.[0]
        ),
        academicYearMarksheets: await Promise.all(
          [
            { year: "1st Year", file: req.files.firstYearMarksheet?.[0] },
            { year: "2nd Year", file: req.files.secondYearMarksheet?.[0] },
            { year: "3rd Year", file: req.files.thirdYearMarksheet?.[0] },
            { year: "4th Year", file: req.files.fourthYearMarksheet?.[0] },
            { year: "5th Year", file: req.files.fifthYearMarksheet?.[0] },
          ]
            .map(async (marksheet) =>
              marksheet.file
                ? {
                    year: marksheet.year,
                    filePath: await uploadToCloudinary(marksheet.file),
                  }
                : null
            )
            .filter((marksheet) => marksheet !== null)
        ),
      },
      photograph: await uploadToCloudinary(req.files.doctorPhotograph?.[0]),
      mciRegistration: await uploadToCloudinary(req.files.mciRegistration?.[0]),
    };

    // Upload clinic photographs
    const clinicPhotos = await uploadMultipleToCloudinary(
      req.files.clinicPhotographs
    );

    // Create doctor record in the database
    const doctor = await Doctor.create({
      name,
      category,
      registrationNumber,
      clinicName,
      degree,
      aadharCardNumber,
      contactInfo: { phone: mobileNumber, email },
      clinics: [
        {
          clinicName,
          location: {
            address: clinicLocation,
            latitude,
            longitude,
          },
          clinicPhotos,
        },
      ],
      documents: uploadedDocuments,
      status,
    });

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

