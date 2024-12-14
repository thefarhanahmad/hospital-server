const Pharmacy = require("../models/Pharmacy");
const PharmacyInventory = require("../models/PharmacyInventory");
const PharmacyBill = require("../models/PharmacyBill");
const Medicine = require("../models/Medicine");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getInventory = catchAsync(async (req, res) => {
  const inventory = await PharmacyInventory.find({ pharmacy: req.user._id })
    .populate("medicine")
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

exports.updateInventory = catchAsync(async (req, res, next) => {
  const {
    medicineId,
    batchNumber,
    quantity,
    expiryDate,
    purchasePrice,
    sellingPrice,
  } = req.body;

  // Validate medicine exists
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError("Medicine not found", 404));
  }

  // Update or create inventory entry
  const inventory = await PharmacyInventory.findOneAndUpdate(
    {
      pharmacy: req.user._id,
      medicine: medicineId,
      batchNumber,
    },
    {
      quantity,
      expiryDate,
      purchasePrice,
      sellingPrice,
      ...req.body,
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
      pharmacy: req.user._id,
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
      populate: { path: "medicine" },
    })
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bills.length,
    data: { bills },
  });
});
