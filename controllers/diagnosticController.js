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

  res.status(200).json({
    status: "success",
    results: tests.length,
    data: { tests },
  });
});

exports.createReport = catchAsync(async (req, res, next) => {
  try {
    // Destructure the data from the request body
    const { test, patient, performedAt, conclusion, status, radiologist } =
      req.body;

    // Log the incoming data for debugging
    console.log("req body : ", req.body);
    console.log("req files : ", req.files);

    // Parse the stringified findings and recommendations
    const findings = JSON.parse(req.body.findings); // Parse the stringified JSON
    const recommendations = JSON.parse(req.body.recommendations) || []; // Parse recommendations or default to empty array

    // Validate test existence
    const testExists = await DiagnosticTest.findOne({
      _id: test,
      center: req.user._id,
    });
    if (!testExists) {
      return next(new AppError("Test not found", 404));
    }

    // Create the diagnostic report
    const report = await DiagnosticReport.create({
      test,
      patient,
      performedAt,
      conclusion,
      status,
      radiologist,
      findings, // Save the parsed findings object
      recommendations, // Save the parsed recommendations array

      center: req.user._id,
      reportGeneratedAt: new Date(),
      verifiedBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: { report },
    });
  } catch (err) {
    next(err);
  }
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
