const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");

exports.getAllHospital = catchAsync(async (req, res) => {
  const hospitals = await Hospital.find();
  res.status(200).json({
    status: "success",
    data: { hospitals },
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
