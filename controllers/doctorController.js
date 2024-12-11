const Doctor = require("../models/Doctor");
const DoctorVerification = require("../models/DoctorVerification");
const Consultation = require("../models/Consultation");
const Prescription = require("../models/Prescription");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const User = require("../models/User");

exports.registerDoctor = catchAsync(async (req, res) => {
  console.log("Request body:", req.body);

  try {
    // Extract non-file fields from the request body
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
    } = req.body;

    const alreadyUser = await User.findOne({ email: email });
    if (alreadyUser) {
      return res.status(401).json({
        status: "error",
        message: "already user exists",
      });
    }
    // Initialize an object to hold the uploaded document URLs
    const documents = {
      educationalQualifications: {},
      medicalDegreeDocuments: {},
    };

    // Check if req.files exists and is an array or object
    if (req.files) {
      Object.keys(req.files).forEach((fieldName) => {
        if (Array.isArray(req.files[fieldName])) {
          // Handle multiple files (array of files)
          documents[fieldName] = req.files[fieldName].map((file) => file.path); // Array of Cloudinary URLs
        } else {
          // Handle single file (single file)
          documents[fieldName] = req.files[fieldName].path; // Cloudinary URL
        }
      });

      // Map year-wise marksheets into academicYearMarksheets
      documents.medicalDegreeDocuments.academicYearMarksheets = [
        { year: "1st Year", filePath: req.files.firstYearMarksheet?.[0]?.path },
        {
          year: "2nd Year",
          filePath: req.files.secondYearMarksheet?.[0]?.path,
        },
        { year: "3rd Year", filePath: req.files.thirdYearMarksheet?.[0]?.path },
        {
          year: "4th Year",
          filePath: req.files.fourthYearMarksheet?.[0]?.path,
        },
        { year: "5th Year", filePath: req.files.fifthYearMarksheet?.[0]?.path },
      ].filter((marksheet) => marksheet.filePath); // Exclude empty fields
    }

    documents.medicalDegreeDocuments.degreeCertificate =
      req.files.degreeCertificate?.[0]?.path;

    // Ensure that required fields are present and valid
    if (!documents.medicalDegreeDocuments.degreeCertificate) {
      return res.status(400).json({
        status: "error",
        message: "Medical Degree Certificate is required.",
      });
    }
    if (!aadharCardNumber) {
      return res.status(400).json({
        status: "error",
        message: "Aadhar card number is required.",
      });
    }
    if (!mobileNumber) {
      return res.status(400).json({
        status: "error",
        message: "Mobile number is required.",
      });
    }
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid status. Valid statuses are: Pending, Approved, Rejected.",
      });
    }

    // Create the doctor record in the database
    const doctor = await Doctor.create({
      name,
      registrationNumber,
      clinicName,
      degree,
      aadharCardNumber,
      contactInfo: { phone: mobileNumber, email: email },
      clinics: [
        {
          clinicName,
          location: {
            address: clinicLocation,
            latitude,
            longitude,
          },
        },
      ],
      documents, // Store document URLs
      status,
    });

    // Create the verification record
    // await DoctorVerification.create({
    //   doctor: doctor._id,
    //   documents,
    // });

    // Respond with the created doctor details
    res.status(201).json({
      status: "success",
      data: { doctor },
    });
  } catch (error) {
    // Handle errors and send appropriate response
    console.error("Error in registerDoctor:", error.message);
    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
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
