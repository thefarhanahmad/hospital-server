const DiagnosticTest = require("../models/DiagnosticTest");
const DiagnosticReport = require("../models/DiagnosticReport");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Diagnostic = require("../models/Diagnostic");

// Test Rates and Discounts Management

exports.createDiagnostic = catchAsync(async (req, res) => {
  const {
    name,
    licenseNumber,
    contactInfo,
    address,
    services,
    equipment,
    accreditations
  } = req.body;

  // Validate incoming data (optional additional validation can be added)
  if (!name || !licenseNumber || !contactInfo || !address) {
    return res.status(400).json({
      status: 'fail',
      message: 'Required fields are missing'
    });
  }

  // Create new diagnostic center
  const diagnosticCenter = await Diagnostic.create({
    name,
    licenseNumber,
    contactInfo,
    address,
    services,
    equipment,
    accreditations
  });

  // Send response
  res.status(201).json({
    status: 'success',
    data: {
      diagnosticCenter
    }
  });
});

exports.createTest = catchAsync(async (req, res) => {
  const { basePrice, discountPercentage } = req.body;
  const discountedPrice = discountPercentage
    ? basePrice - (basePrice * discountPercentage) / 100
    : null;

  const test = await DiagnosticTest.create({
    ...req.body,
    discountedPrice,
    center: req.user._id,
  });

  res.status(200).json({
    status: "test created success",
    data: { test },
  });
});

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
    const {
      test,
      patient,
      performedAt,
      conclusion,
      status,
      findings,
      recommendations,
    } = req.body;

    // Log the incoming data for debugging
    console.log("req body : ", req.body);

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
      findings,
      recommendations,
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
    .populate("verifiedBy", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: reports.length,
    data: { reports },
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
