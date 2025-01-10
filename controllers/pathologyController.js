const PathologyTest = require("../models/PathologyTest");
const PathologyReport = require("../models/PathologyReport");
const PathologyInventory = require("../models/PathologyInventory");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Equipment = require("../models/Equipment");
const PathologyLab = require("../models/PathologyLab");
const User = require("../models/User");
const LabCategory = require("../models/labCategory");
exports.createPathologyLab = catchAsync(async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      contactInfo,
      address,
      tests,
      certifications,
      sampleCollection,
    } = req.body;
    const newPathologyLab = new PathologyLab({
      userId: req.user._id,
      name,
      licenseNumber,
      contactInfo,
      address,
      tests,
      certifications,
      sampleCollection,
    });
    await newPathologyLab.save();

    return res.status(201).json({
      message: "Pathology lab created successfully",
      data: newPathologyLab,
    });
  } catch (error) {
    console.error("Error creating pathology lab:", error);
    return res.status(500).json({
      message: "Failed to create pathology lab",
      error: error.message,
    });
  }
});
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
      lab: req.user._id,
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
exports.createEquipment = async (req, res) => {
  try {
    const { name, model, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Equipment name is required" });
    }

    const equipment = new Equipment({
      labId: req.user._id,
      name,
      model,
      description,
    });

    await equipment.save();
    res.status(201).json({
      message: "Equipment created successfully",
      equipment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.status(200).json({
      userId: req.user._id,
      status: true,
      message: "all Equipment get successfully",
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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

exports.getlabCategory = catchAsync(async (req, res) => {
  const labCategory = await LabCategory.find();
  res.status(200).json({
    status: "success",
    message: "All medicine categories retrieved successfully.",
    data: labCategory,
  });
});