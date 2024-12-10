const Hospital = require("../models/Hospital");
const HospitalVerification = require("../models/HospitalVerification");
const BedInventory = require("../models/BedInventory");
const PatientAdmission = require("../models/PatientAdmission");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.registerHospital = catchAsync(async (req, res) => {
  console.log("Hospital Type: ", req.body.type); // Log the 'type' field
  console.log("Request Body: ", req.body); // Log the entire body

  const hospital = await Hospital.create(req.body);

  await HospitalVerification.create({
    hospital: hospital._id,
    documents: req.body.documents,
  });

  res.status(201).json({
    status: "success",
    data: { hospital },
  });
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
