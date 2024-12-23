const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const PharmacyBill = require("../models/PharmacyBill");
const Medicine = require("../models/Medicine");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a Pharmacy
exports.createPharmacy = async (req, res) => {
  try {
    // Merge all fields from req and include pharmacyId from req.user
    const pharmacyData = { ...req.body, pharmacyId: req.user._id };

    const pharmacy = await Pharmacy.create(pharmacyData);
    res.status(201).json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
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
      pharmacyId:req.user._id
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

exports.getInventory = catchAsync(async (req, res) => {
  const inventory = await PharmacyInventory.find({ pharmacyId: req.user._id })
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

exports.createInventory = catchAsync(async (req, res, next) => {
  const {
    medicineId,
    batchNumber,
    quantity,
    expiryDate,
    purchasePrice,
    sellingPrice,
  } = req.body;


 

  // Update or create inventory entry
  const inventory = await PharmacyInventory.findOneAndUpdate(
    {
      pharmacyId: req.user._id,
      medicineId: medicineId,
      batchNumber,
    },
    {
      quantity,
      expiryDate,
      purchasePrice,
      sellingPrice,
      ...req.body,
      pharmacyId: req.user._id,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

exports.createBill = catchAsync(async (req, res, next) => {
  const { items, patient, prescription, paymentMethod } = req.body;

  // Validate inventory and calculate totals
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const inventory = await PharmacyInventory.findOne({
      _id: item.inventory,
      pharmacyId: req.user._id,
    });

    if (!inventory) {
      return next(new AppError("Invalid inventory item", 400));
    }

    if (inventory.quantity < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for item: ${inventory.medicine.name}`,
          400
        )
      );
    }

    const itemTotal = item.quantity * inventory.sellingPrice;
    subtotal += itemTotal;

    validatedItems.push({
      inventory: inventory._id,
      quantity: item.quantity,
      price: inventory.sellingPrice,
      discount: item.discount || 0,
    });

    // Update inventory
    inventory.quantity -= item.quantity;
    await inventory.save();
  }

  // Calculate tax and total
  const tax = subtotal * 0.18; // 18% GST
  const totalDiscount = validatedItems.reduce(
    (acc, item) => acc + item.discount,
    0
  );
  const total = subtotal + tax - totalDiscount;

  const bill = await PharmacyBill.create({
    pharmacy: req.user._id,
    patient,
    prescription,
    items: validatedItems,
    subtotal,
    tax,
    totalDiscount,
    total,
    paymentMethod,
    status: "completed",
  });

  res.status(201).json({
    status: "success",
    data: { bill },
  });
});

exports.getBills = catchAsync(async (req, res) => {
  const bills = await PharmacyBill.find({ pharmacy: req.user._id })
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