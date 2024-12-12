const Hospital = require("../models/Hospital");
const HospitalVerification = require("../models/HospitalVerification");
const BedInventory = require("../models/BedInventory");
const PatientAdmission = require("../models/PatientAdmission");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const cloudinary = require("../config/cloudinary");

exports.registerHospital = catchAsync(async (req, res) => {
  console.log("Request Body: ", req.body);

  try {
    // Destructure non-file fields from the request body
    const {
      name,
      cmoNumber,
      insuranceServices,
      ownershipInformation,
      registrationBasis,
      chargesOverview,
      doctorAvailability,
    } = req.body;

    // Initialize hospitalImages array for storing uploaded images' URLs
    const hospitalImages = [];
    if (req.files?.hospitalImages) {
      for (const file of req.files.hospitalImages) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "hospital_images", // Specify Cloudinary folder
        });
        hospitalImages.push(result.secure_url); // Save Cloudinary URL
      }
    }

    // Construct hospital data for the schema
    const hospitalData = {
      name,
      cmoNumber,
      hospitalImages, // Add processed images
      insuranceServices: {
        tps: insuranceServices?.tps || [],
        ayushmanBharat: {
          enabled: insuranceServices?.ayushmanBharat?.enabled || false,
          specialties: insuranceServices?.ayushmanBharat?.specialties || [],
          beds: insuranceServices?.ayushmanBharat?.beds || 0,
        },
        cghs: {
          enabled: insuranceServices?.cghs?.enabled || false,
          specialties: insuranceServices?.cghs?.specialties || [],
          beds: insuranceServices?.cghs?.beds || 0,
        },
      },
      ownershipInformation: {
        enabled: ownershipInformation?.enabled || false,
        ownershipType: ownershipInformation?.ownershipType || null,
        customDetails: ownershipInformation?.customDetails || null,
      },
      registrationBasis,
      chargesOverview:
        chargesOverview?.map((charge) => ({
          chargeName: charge.chargeName,
          timing: charge.timing,
          price: charge.price,
        })) || [],
      doctorAvailability: {
        availableDoctors:
          doctorAvailability?.availableDoctors?.map((doctor) => ({
            name: doctor.name,
            status: doctor.status,
          })) || [],
        onCallDoctors: doctorAvailability?.onCallDoctors || 0,
        permanentDoctors: doctorAvailability?.permanentDoctors || 0,
        doctorDutyTimings:
          doctorAvailability?.doctorDutyTimings?.map((timing) => ({
            doctorName: timing.doctorName,
            shift: {
              start: timing.shift?.start || null,
              end: timing.shift?.end || null,
            },
          })) || [],
      },
    };

    // Save the hospital to the database
    const hospital = await Hospital.create(hospitalData);

    // Handle additional documents for verification if provided
    // if (req.body.documents) {
    //   await HospitalVerification.create({
    //     hospital: hospital._id,
    //     documents: req.body.documents,
    //   });
    // }

    // Respond with success
    res.status(201).json({
      status: "success",
      data: { hospital },
    });
  } catch (error) {
    // Handle errors and respond appropriately
    console.error("Error in registerHospital:", error.message);
    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
    });
  }
});

exports.verifyHospital = catchAsync(async (req, res, next) => {
  const verification = await HospitalVerification.findOne({
    hospital: req.params.id,
  });

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

exports.getBedStatus = catchAsync(async (req, res) => {
  const bedStatus = await BedInventory.find({
    hospital: req.user._id,
  });

  res.status(200).json({
    status: "success",
    data: { bedStatus },
  });
});

exports.updateBedStatus = catchAsync(async (req, res, next) => {
  const { ward, totalBeds, occupiedBeds } = req.body;

  // Check if occupiedBeds exceeds totalBeds
  if (occupiedBeds > totalBeds) {
    return next(new AppError("Occupied beds cannot exceed total beds", 400));
  }

  const bedInventory = await BedInventory.findOneAndUpdate(
    {
      hospital: req.user._id,
      ward,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!bedInventory) {
    return next(new AppError("Bed inventory not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { bedInventory },
  });
});

exports.admitPatient = catchAsync(async (req, res, next) => {
  // Check bed availability
  const bedInventory = await BedInventory.findById(req.body.bedInventory);

  if (!bedInventory || bedInventory.availableBeds <= 0) {
    return next(new AppError("No beds available in selected ward", 400));
  }

  // Create admission record
  const admission = await PatientAdmission.create({
    ...req.body,
    hospital: req.user._id,
  });

  // Update bed inventory
  bedInventory.occupiedBeds += 1;
  await bedInventory.save();

  res.status(201).json({
    status: "success",
    data: { admission },
  });
});

exports.dischargePatient = catchAsync(async (req, res, next) => {
  const admission = await PatientAdmission.findById(req.params.id);

  if (!admission || admission.status === "discharged") {
    return next(new AppError("Invalid admission record", 404));
  }

  // Update admission record
  admission.status = "discharged";
  admission.dischargedAt = new Date();
  admission.billing = req.body.billing;
  await admission.save();

  // Update bed inventory
  const bedInventory = await BedInventory.findById(admission.bedInventory);
  bedInventory.occupiedBeds -= 1;
  await bedInventory.save();

  res.status(200).json({
    status: "success",
    data: { admission },
  });
});
