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
const Diagnostic = require("../models/Diagnostic");
const Equipment = require("../models/Equipment");
const doctorCategory = require("../models/doctorCategory");
const medicineCategory = require("../models/medicineCategory");
const LabCategory = require("../models/labCategory");
const BloodBank = require("../models/BloodBank");

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
  const equipment = await Equipment.find().populate({
    path: "labId",
    select: "name",
  });
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
  const patients = await Patient.find()
    .populate({ path: "hospital", select: "name" })
    .populate({ path: "patient", select: "name" })
    .populate({ path: "attendingDoctor", select: "name" });
  
  res.status(200).json({
    status: "success",
    data: { patients: patients },
  });
});
exports.getAllAppointments = catchAsync(async (req, res) => {
  const appointment = await Appointment.find()
    .populate({ path: "user", select: "name email" })
    .populate({ path: "hospital", select: "name address" })
    .populate({
      path: "doctor",
      select: "name category",
      populate: { path: "category", select: "name" },
    });
  res.status(200).json({
    status: "success",
    data: { appointment },
  });
});
exports.getAllMedicines = catchAsync(async (req, res) => {
  const allMedicine = await Medicine.find().populate({
    path: "pharmacyId",
    select: "name",
  });
  
  res.status(200).json({
    status: "success",
    data: { allMedicine },
  });
});
exports.getAllbadInventries = catchAsync(async (req, res) => {
  const badInventries = await BadInventries.find().populate({
    path: "hospital",
    select: "name",
  });

  res.status(200).json({
    status: "success",
    data: { badInventries },
  });
});
exports.getAllBloodBank = catchAsync(async (req, res) => {
  const allBloodBank = await BloodBank.find();
  res.status(200).json({
    status: "success",
    data: { allBloodBank },
  });
});
exports.getAllbloodInventries = catchAsync(async (req, res) => {
  const bloodInventries = await BloodInventries.find().populate({
    path: "bloodBankId",
    select: "name",
  });
  res.status(200).json({
    status: "success",
    data: { bloodInventries },
  });
});
exports.getAllPathologyInventries = catchAsync(async (req, res) => {
  const pathologyInventries = await PathologyInventries.find().populate({
    path: "lab",
    select: "name",
  });
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
exports.addMedicineCategory = catchAsync(async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await medicineCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    const category = new medicineCategory({ name });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Medicine Category added successfully",
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
exports.addlabCategory = catchAsync(async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await LabCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }
    const category = new LabCategory({ name });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Lab Category added successfully",
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
exports.getAllMedicineCategory = catchAsync(async (req, res) => {
  const medicineCategories = await medicineCategory.find();
  res.status(200).json({
    status: "success",
    message: "All medicine categories retrieved successfully.",
    data: medicineCategories,
  });
});
exports.getlabCategory = catchAsync(async (req, res) => {
  const labCategory = await LabCategory.find();
  res.status(200).json({
    status: "success",
    message: "All medicine categories retrieved successfully.",
    data: labCategory,
  });
});
