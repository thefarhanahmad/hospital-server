const DiagnosticTest = require("../models/DiagnosticTest");
const DiagnosticReport = require("../models/DiagnosticReport");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Test Rates and Discounts Management
exports.addOrUpdateTest = catchAsync(async (req, res) => {
  const { basePrice, discountPercentage } = req.body;
  const discountedPrice = discountPercentage
    ? basePrice - (basePrice * discountPercentage) / 100
    : null;

  const test = await DiagnosticTest.findOneAndUpdate(
    {
      _id: req.params.id,
      center: req.user._id,
    },
    {
      ...req.body,
      discountedPrice,
      center: req.user._id,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: { test },
  });
});

exports.getTests = catchAsync(async (req, res) => {
  const tests = await DiagnosticTest.find({
    center: req.user._id,
    active: true,
  });
  // .populate("Equipment", "name model")
  // .sort("category name");

  res.status(200).json({
    status: "success",
    results: tests.length,
    data: { tests },
  });
});

// Report Management
exports.createReport = catchAsync(async (req, res, next) => {
  const { test, patient } = req.body;

  // Validate test exists
  const testExists = await DiagnosticTest.findOne({
    _id: test,
    center: req.user._id,
  });

  if (!testExists) {
    return next(new AppError("Test not found", 404));
  }

  const report = await DiagnosticReport.create({
    ...req.body,
    center: req.user._id,
    reportGeneratedAt: new Date(),
    verifiedBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { report },
  });
});

exports.getReports = catchAsync(async (req, res) => {
  const reports = await DiagnosticReport.find({
    center: req.user._id,
  })
    .populate("patient", "name email")
    .populate("test", "name category")
    .populate("radiologist", "name")
    .populate("verifiedBy", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: reports.length,
    data: { reports },
  });
});
