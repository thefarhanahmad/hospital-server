const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const PharmacyBill = require("../models/PharmacyBill");
const Medicine = require("../models/Medicine");
const { catchAsync } = require("../utils/catchAsync");

exports.createPharmacy = async (req, res) => {
  try {
    const existingPharmacy = await Pharmacy.findOne({
      pharmacyId: req.user._id,
    });

    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: "Only one pharmacy can be added",
      });
    }

    const pharmacyData = { ...req.body, pharmacyId: req.user._id };
    const pharmacy = await Pharmacy.create(pharmacyData);
    res.status(201).json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
exports.createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      manufacturer,
      category,
      prescriptionRequired,
      composition,
      dosageForm,
      strength,
      packaging,
      mrp,
    } = req.body;

    const newMedicine = new Medicine({
      name,
      genericName,
      manufacturer,
      category,
      prescriptionRequired,
      composition,
      dosageForm,
      strength,
      packaging,
      mrp,
      pharmacyId: req.user._id,
    });

    // Save the medicine to the database
    const savedMedicine = await newMedicine.save();

    // Respond with the saved medicine data
    res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data: savedMedicine,
    });
  } catch (error) {
    // Handle validation and server errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getMedicine = catchAsync(async (req, res) => {
  const medicine = await Medicine.find({ pharmacyId: req.user._id });
  res.status(200).json({
    status: "success",
    data: { medicine: medicine },
  });
});
exports.createInventory = async (req, res) => {
  try {
    const {
      branch,
      medicineId,
      batchNumber,
      quantity,
      expiryDate,
      purchasePrice,
      sellingPrice,
      reorderLevel,
      location,
    } = req.body;
    const newInventory = new PharmacyInventory({
      branch,
      medicineId,
      batchNumber,
      quantity,
      expiryDate,
      purchasePrice,
      sellingPrice,
      reorderLevel,
      location,
      pharmacyId: req.user._id,
    });
    await newInventory.save();
    res.status(201).json({
      message: "Inventory created successfully!",
      data: newInventory,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      message: "Error creating inventory.",
      error: error.message,
    });
  }
};
exports.getInventory = catchAsync(async (req, res) => {
  const { branchId } = req.query;
  const inventory = await PharmacyInventory.find({ branch: branchId })
    .populate("medicineId")
    .sort("medicine.name");

  // Add low stock warning
  const inventoryWithStatus = inventory.map((item) => ({
    ...item.toObject(),
    status: item.quantity <= item.reorderLevel ? "low" : "normal",
  }));

  res.status(200).json({
    status: "success",
    results: inventory.length,
    data: { inventory: inventoryWithStatus },
  });
});
exports.getallPharmacyInventories = catchAsync(async (req, res) => {
  const inventories = await PharmacyInventory.find({
    pharmacyId: req.user._id,
  });

  res.status(200).json({
    status: "success",
    results: inventories.length,
    data: { inventories },
  });
});
exports.updateInventory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, purchasePrice, sellingPrice, reorderLevel } = req.body;
  const inventory = await PharmacyInventory.findByIdAndUpdate(
    id,
    {
      quantity,
      purchasePrice,
      sellingPrice,
      reorderLevel,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!inventory) {
    return res.status(404).json({
      status: "fail",
      message: "Inventory item not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});
exports.getBills = catchAsync(async (req, res) => {
  const { pharmacyId } = req.body;
  const bills = await PharmacyBill.find({ pharmacy: pharmacyId })
    .populate("patient", "name email")
    .populate("prescription")
    .populate({
      path: "items.inventory",
      populate: { path: "medicineId" },
    })
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bills.length,
    data: { bills },
  });
});
exports.getAllPharmacy = catchAsync(async (req, res) => {
  const pharmacy = await Pharmacy.find({ pharmacyId: req.user._id });
  res.status(200).json({
    status: "success",
    data: { pharmacy },
  });
});