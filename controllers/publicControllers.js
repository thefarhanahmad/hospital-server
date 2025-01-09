const { catchAsync } = require("../utils/catchAsync");

const User = require("../models/User");
const Prescription = require("../models/Prescription");

exports.getAllPatients = catchAsync(async (req, res) => {
  const patients = await User.find({
    role: "user",
  });

  res.status(200).json({
    status: "success",
    results: patients.length,
    data: { patients },
  });
});

exports.getAllPriscriptions = catchAsync(async (req, res) => {
  const priscriptions = await Prescription.find();

  res.status(200).json({
    status: "success",
    results: priscriptions.length,
    data: { priscriptions },
  });
});
