const MedicineOrder = require("../models/MedicineOrder");
const DiagnosticBooking = require("../models/DiagnosticBooking");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

exports.orderMedicine = catchAsync(async (req, res, next) => {
  const { items, pharmacy, prescription, deliveryAddress } = req.body;
  // Convert string IDs to ObjectId using new mongoose.Types.ObjectId()
  const pharmacyId = new mongoose.Types.ObjectId(pharmacy); // Use 'new' here
  const prescriptionId = prescription
    ? new mongoose.Types.ObjectId(prescription)
    : null;

  // Map the medicine items to ObjectId using 'new'
  const itemsWithObjectId = items.map((item) => ({
    ...item,
    medicine: new mongoose.Types.ObjectId(item.medicine), // Correct usage with 'new'
  }));

  // Calculate totals
  const subtotal = itemsWithObjectId.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% GST
  const deliveryCharges = 50; // Fixed delivery charge
  const total = subtotal + tax + deliveryCharges;

  // Create the order
  const order = await MedicineOrder.create({
    user: req.user._id,
    pharmacy: pharmacyId,
    prescription: prescriptionId,
    items: itemsWithObjectId,
    deliveryAddress,
    subtotal,
    tax,
    deliveryCharges,
    total,
  });

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await MedicineOrder.find({ user: req.user._id })
    .populate("pharmacy", "name")
    .populate("items.medicine", "name manufacturer")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});

exports.bookTest = catchAsync(async (req, res) => {
  // Check the user ID
  console.log("User ID:", req.user._id);

  // Proceed if valid user ID is present
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid User ID" });
  }

  const booking = await DiagnosticBooking.create({
    ...req.body,
    user: req.user._id, // Ensure this is a valid ObjectId
    total: req.body.tests.reduce((sum, test) => sum + test.test.price, 0),
  });

  res.status(201).json({
    status: "success",
    data: { booking },
  });
});

exports.getTestResults = catchAsync(async (req, res) => {
  const bookings = await DiagnosticBooking.find({
    user: req.user._id,
    
  })
    .populate("center", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { bookings },
  });
});
