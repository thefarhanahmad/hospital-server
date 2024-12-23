const PathologyTest = require("../models/PathologyTest");
const PathologyReport = require("../models/PathologyReport");
const PathologyInventory = require("../models/PathologyInventory");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Test Management
exports.addTest = catchAsync(async (req, res) => {
  console.log("req user pathlab : ", req.user);

  const test = await PathologyTest.create({
    ...req.body,
    lab: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { test },
  });
});

exports.getTests = catchAsync(async (req, res) => {
  const tests = await PathologyTest.find({
    lab: req.user._id,
    active: true,
  }).sort("name");

  res.status(200).json({
    status: "success",
    results: tests.length,
    data: { tests },
  });
});

// Report Generation
exports.generateReport = catchAsync(async (req, res, next) => {
  const { test, patient, results } = req.body;

  // Validate test exists
  const testDetails = await PathologyTest.findOne({
    _id: test,
    lab: req.user._id,
  });

  if (!testDetails) {
    return next(new AppError("Test not found", 404));
  }

  const report = await PathologyReport.create({
    lab: req.user._id,
    test,
    patient,
    results,
    sampleCollectedAt: req.body.sampleCollectedAt,
    reportGeneratedAt: new Date(),
    interpretation: req.body.interpretation,
    remarks: req.body.remarks,
    status: "completed",
    verifiedBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { report },
  });
});

exports.getReports = catchAsync(async (req, res) => {
  const reports = await PathologyReport.find({ lab: req.user._id })
    .populate("patient", "name email")
    .populate("test", "name category")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: reports.length,
    data: { reports },
  });
});

//Inventory Create
exports.createInventory = async (req, res) => {
  try {
    const {
      lab,
      item,
      batchNumber,
      quantity,
      reorderLevel,
      expiryDate,
      location,
      status,
    } = req.body;

    // Create a new inventory item
    const newInventory = new PathologyInventory({
     lab:req.user._id,
      item,
      batchNumber,
      quantity,
      reorderLevel,
      expiryDate,
      location,
      status,
    });

    // Save to the database
    await newInventory.save();

    res.status(201).json({
      message: "Inventory item created successfully.",
      inventory: newInventory,
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// Inventory Management
exports.getInventory = catchAsync(async (req, res) => {
  const inventory = await PathologyInventory.find({
    lab: req.user._id,
  }).sort("item.name");

  // Update status based on quantity and expiry
  const updatedInventory = inventory.map((item) => {
    const itemObj = item.toObject();
    if (item.quantity <= item.reorderLevel) {
      itemObj.status = "low";
    }
    if (item.expiryDate && new Date(item.expiryDate) <= new Date()) {
      itemObj.status = "expired";
    }
    return itemObj;
  });

  res.status(200).json({
    status: "success",
    results: inventory.length,
    data: { inventory: updatedInventory },
  });
});