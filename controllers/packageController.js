const Package = require("../models/Package");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

