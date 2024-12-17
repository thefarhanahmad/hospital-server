const Doctor = require("../models/Doctor");
const DoctorVerification = require("../models/DoctorVerification");
const Consultation = require("../models/Consultation");
const Prescription = require("../models/Prescription");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary")
const mongoose = require("mongoose");
const User = require("../models/User");
const fs=require("fs")
exports.registerDoctor = catchAsync(async (req, res) => {
  try {
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

    // Check if user already exists
    const alreadyUser = await Doctor.findOne({ contactInfo:{email:email}});
    if (alreadyUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists with this email.",
      });
    }

    // Prepare the documents object to store file paths
    const documents = {
      educationalQualifications: {
        tenthMarksheet: req.files.tenthMarksheet?.[0]?.path,
        twelfthMarksheet: req.files.twelfthMarksheet?.[0]?.path,
      },
      medicalDegreeDocuments: {
        degreeCertificate: req.files.degreeCertificate?.[0]?.path,
        academicYearMarksheets: [
          {
            year: "1st Year",
            filePath: req.files.firstYearMarksheet?.[0]?.path,
          },
          {
            year: "2nd Year",
            filePath: req.files.secondYearMarksheet?.[0]?.path,
          },
          {
            year: "3rd Year",
            filePath: req.files.thirdYearMarksheet?.[0]?.path,
          },
          {
            year: "4th Year",
            filePath: req.files.fourthYearMarksheet?.[0]?.path,
          },
          {
            year: "5th Year",
            filePath: req.files.fifthYearMarksheet?.[0]?.path,
          },
        ].filter((marksheet) => marksheet.filePath),
      },
      photograph: req.files.doctorPhotograph?.[0]?.path,
      mciRegistration: req.files.mciRegistration?.[0]?.path,
    };

    // Function to upload files to Cloudinary and delete them from the local server after upload
    const cloudinaryUploads = async (filePaths) => {
      const uploadPromises = filePaths.map(async (filePath) => {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "doctor_documents", 
        });
        fs.unlinkSync(filePath); 
        return uploadResult.secure_url;
      });
      return await Promise.all(uploadPromises); 
    };

    // Upload the documents to Cloudinary and store the URLs in the database
    const uploadedFiles = {
      educationalQualifications: {
        tenthMarksheet: documents.educationalQualifications.tenthMarksheet
          ? await cloudinaryUploads([
              documents.educationalQualifications.tenthMarksheet,
            ])[0]
          : undefined,
        twelfthMarksheet: documents.educationalQualifications.twelfthMarksheet
          ? await cloudinaryUploads([
              documents.educationalQualifications.twelfthMarksheet,
            ])[0]
          : undefined,
      },
      medicalDegreeDocuments: {
        degreeCertificate: documents.medicalDegreeDocuments.degreeCertificate
          ? await cloudinaryUploads([
              documents.medicalDegreeDocuments.degreeCertificate,
            ])[0]
          : undefined,
        academicYearMarksheets: await cloudinaryUploads(
          documents.medicalDegreeDocuments.academicYearMarksheets.map(
            (marksheet) => marksheet.filePath
          )
        ),
      },
      photograph: documents.photograph
        ? await cloudinaryUploads([documents.photograph])[0]
        : undefined,
      mciRegistration: documents.mciRegistration
        ? await cloudinaryUploads([documents.mciRegistration])[0]
        : undefined,
    };

    // Create doctor record in the database with Cloudinary URLs
    const doctor = await Doctor.create({
      name,
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
        },
      ],
      documents: uploadedFiles, 
      status,
    });

    res.status(201).json({
      status: "success",
      message: "Doctor registered successfully!",
      data: { doctor },
    });
  } catch (error) {
    console.error("Error in registerDoctor:", error.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
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
