const Package = require("../models/Package");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createUserPackage = catchAsync(async (req, res) => {
  const package = await Package.create({
    ...req.body,
    type: "user",
  });

  res.status(201).json({
    status: "success",
    data: { package },
  });
});

exports.createVendorPackage = catchAsync(async (req, res) => {
  const package = await Package.create({
    ...req.body,
    type: "vendor",
  });

  res.status(201).json({
    status: "success",
    data: { package },
  });
});

exports.getUserPackages = catchAsync(async (req, res) => {
  const packages = await Package.find({
    type: "user",
    active: true,
  }).sort("priority");

  res.status(200).json({
    status: "success",
    results: packages.length,
    data: { packages },
  });
});

exports.getVendorPackages = catchAsync(async (req, res) => {
  const { vendorType } = req.query;

  const query = {
    type: "vendor",
    active: true,
  };

  if (vendorType) {
    query.vendorType = vendorType;
  }

  const packages = await Package.find(query).sort("priority");

  res.status(200).json({
    status: "success",
    results: packages.length,
    data: { packages },
  });
});