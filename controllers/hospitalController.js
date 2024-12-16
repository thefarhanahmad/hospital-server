const Hospital = require("../models/Hospital");
const HospitalVerification = require("../models/HospitalVerification");
const BedInventory = require("../models/BedInventory");
const PatientAdmission = require("../models/PatientAdmission");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

exports.registerHospital = async (req, res) => {
  console.log(req.body)
  try {
    const {
      registrationNumber,
      name,
      type,
      email,
      cmoNumber,
      insuranceServices,
      ownershipInformation,
      registrationBasis,
      chargesOverview,
      hospitalImages,
      doctorAvailability,
    } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Provided email is not associated with any user.",
      });
    }

    // const hospitalImages = req.files?.hospitalImages
    //   ? await Promise.all(
    //       req.files.hospitalImages.map(async (file) => {
    //         const result = await cloudinary.uploader.upload(file.path, {
    //           folder: "hospital_images",
    //         });
    //         return result.secure_url;
    //       })
    //     )
    //   : [];

    const hospital = await Hospital.create({
      registrationNumber: registrationNumber,
      type: type,
      email,
      name: name,
      cmoNumber: cmoNumber,
      hospitalImages,
      insuranceServices: {
        ...insuranceServices,
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
      chargesOverview: chargesOverview || [],
      doctorAvailability: {
        availableDoctors: doctorAvailability?.availableDoctors || [],
        onCallDoctors: doctorAvailability?.onCallDoctors || 0,
        permanentDoctors: doctorAvailability?.permanentDoctors || 0,
      },
    });

    // Respond with success
    res.status(201).json({
      status: "success",
      data: { hospital },
    });
  } catch (error) {
    console.error("Error in registerHospital:", error.message);
    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong.",
    });
  }
};

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

exports.createBed = async (req, res) => {
  try {
    const { ward, totalBeds, occupiedBeds, charges, facilities } = req.body;
    const hospitalId = req.user._id;
    console.log(hospitalId);
    if (!hospitalId) {
      return res.status(400).json({ message: "Hospital ID is required" });
    }

    const newBedInventory = new BedInventory({
      hospital: hospitalId,
      ward,
      totalBeds,
      occupiedBeds,
      charges: {
        base: charges.base,
        nursing: charges.nursing,
        oxygen: charges.oxygen,
        ventilator: charges.ventilator,
      },
      facilities,
    });

    const savedBedInventory = await newBedInventory.save();

    res.status(201).json(savedBedInventory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating bed inventory", error: error.message });
  }
};

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
  const bedInventory = await BedInventory.findById(req.body.bedInventory);

  if (!bedInventory || bedInventory.availableBeds <= 0) {
    return next(new AppError("No beds available in selected ward", 400));
  }

  const admission = await PatientAdmission.create({
    ...req.body,
    hospital: req.user._id,
  });

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