const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Patient = require("../models/PatientAdmission");
const Appointment = require("../models/Appointment");
const Medicine = require("../models/Medicine");
const BadInventries = require("../models/BedInventory");
const PathologyInventries = require("../models/PathologyInventory");
const BloodInventries = require("../models/BloodInventory");
const { catchAsync } = require("../utils/catchAsync");
const Doctor = require("../models/Doctor");
const Package = require("../models/Package");
const PathologyLab = require("../models/PathologyLab");
const Diagnostic = require("../models/Diagnostic")
const Equipment = require("../models/Equipment")
exports.getAllHospital = catchAsync(async (req, res) => {
  const hospitals = await Hospital.find();
  res.status(200).json({
    status: "success",
    data: { hospitals },
  });
});
exports.getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.find();
  res.status(200).json({
    status: "success",
    data: { doctors },
  });
});
exports.getAllPharmacy = catchAsync(async (req, res) => {
  const pharmacy = await Pharmacy.find();
  res.status(200).json({
    status: "success",
    data: { pharmacy },
  });
});

exports.getAllPathology = catchAsync(async (req, res) => {
  const pathologyLab = await PathologyLab.find();
  res.status(200).json({
    status: "success",
    message: "all pathology List Retrieve Successfully",
    data: pathologyLab,
  });
});
exports.getAllDiagnostic = catchAsync(async (req, res) => {
  const diagnostic = await Diagnostic.find();
  res.status(200).json({
    status: "success",
    message: "all Diagnostic List Retrieve Successfully",
    data: diagnostic,
  });
});
exports.getAllEquipment = catchAsync(async (req, res) => {
  const equipment = await Equipment.find();
  res.status(200).json({
    status: "success",
    message: "all equipment List Retrieve Successfully",
    data: equipment,
  });
});

exports.getUserPackages = catchAsync(async (req, res) => {
  const packages = await Package.find({
    active: true,
  }).sort("priority");

  res.status(200).json({
    status: "success",
    results: packages.length,
    data: { packages },
  });
});
exports.getAllPatient = catchAsync(async (req, res) => {
  const patient = await Patient.find();
  res.status(200).json({
    status: "success",
    data: { patient },
  });
});
exports.getAllAppointments = catchAsync(async (req, res) => {
  const appointment = await Appointment.find();
  res.status(200).json({
    status: "success",
    data: { appointment },
  });
});

exports.getAllMedicines = catchAsync(async (req, res) => {
  const allMedicine = await Medicine.find();
  res.status(200).json({
    status: "success",
    data: { allMedicine },
  });
});
exports.getAllbadInventries = catchAsync(async (req, res) => {
  const badInventries = await BadInventries.find();
  res.status(200).json({
    status: "success",
    data: { badInventries },
  });
});
exports.getAllbloodInventries = catchAsync(async (req, res) => {
  const bloodInventries = await BloodInventries.find();
  res.status(200).json({
    status: "success",
    data: { bloodInventries },
  });
});
exports.getAllPathologyInventries = catchAsync(async (req, res) => {
  const pathologyInventries = await PathologyInventries.find();
  res.status(200).json({
    status: "success",
    data: { pathologyInventries },
  });
});
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-__v");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});
exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User Deleted Successfully",
    data: user,
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUserPackage = catchAsync(async (req, res) => {
  const package = await Package.create({
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: { package },
  });
});
