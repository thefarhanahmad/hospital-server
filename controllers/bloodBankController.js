const BloodInventory = require("../models/BloodInventory");
const BloodRequest = require("../models/BloodRequest");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Inventory Management
exports.updateInventory = catchAsync(async (req, res) => {
  const inventory = await BloodInventory.create({
    ...req.body,
    bloodBank: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { inventory },
  });
});

exports.getAvailability = catchAsync(async (req, res) => {
  const inventory = await BloodInventory.aggregate([
    {
      $match: {
        bloodBank: req.user._id,
        status: "available",
        expiryDate: { $gt: new Date() },
      },
    },
    {
      $group: {
        _id: {
          bloodType: "$bloodType",
          component: "$component",
        },
        quantity: { $sum: "$quantity" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { inventory },
  });
});

// Billing
exports.generateBill = catchAsync(async (req, res, next) => {
  const request = await BloodRequest.findById(req.params.requestId);

  if (!request || request.bloodBank.toString() !== req.user._id.toString()) {
    return next(new AppError("Blood request not found", 404));
  }

  if (request.status !== "approved") {
    return next(
      new AppError("Cannot generate bill for non-approved request", 400)
    );
  }

  // Calculate amount based on component and quantity
  const baseRates = {
    whole: 2000,
    plasma: 1500,
    platelets: 3000,
    rbc: 2500,
  };

  const amount = baseRates[request.component] * request.quantity;

  request.billing = {
    amount,
    paid: false,
  };

  await request.save();

  res.status(200).json({
    status: "success",
    data: {
      requestId: request._id,
      amount,
      component: request.component,
      quantity: request.quantity,
    },
  });
});

// Blood Request Management
exports.createBloodRequest = catchAsync(async (req, res, next) => {
  // Validate that the request body contains necessary fields
  if (!req.body.patient || !req.body.component || !req.body.quantity) {
    return next(
      new AppError(
        "Patient details, component, and quantity are required.",
        400
      )
    );
  }

  // Create a new blood request
  const bloodRequest = await BloodRequest.create({
    bloodBank: req.user._id, // Assuming blood bank is identified by the logged-in user
    requestedBy: req.body.requestedBy, // ID of the requesting hospital
    patient: req.body.patient, // Patient details
    component: req.body.component, // Blood component
    quantity: req.body.quantity, // Quantity requested
    urgency: req.body.urgency || "normal", // Default to normal urgency if not provided
    requiredBy: req.body.requiredBy, // Optional: Required by date
    billing: req.body.billing, // Optional billing details
  });

  res.status(201).json({
    status: "success",
    data: {
      bloodRequest,
    },
  });
});

exports.getBloodRequests = catchAsync(async (req, res) => {
  const requests = await BloodRequest.find({ bloodBank: req.user._id })
    .populate("requestedBy", "name")
    .populate("approvedBy", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: { requests },
  });
});

exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  const request = await BloodRequest.findOneAndUpdate(
    {
      _id: req.params.requestId,
      bloodBank: req.user._id,
    },
    {
      status: req.body.status,
      approvedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!request) {
    return next(new AppError("Blood request not found", 404));
  }

  // Update inventory if request is approved
  if (req.body.status === "approved") {
    const inventory = await BloodInventory.findOneAndUpdate(
      {
        bloodBank: req.user._id,
        bloodType: request.patient.bloodType,
        component: request.component,
        status: "available",
        quantity: { $gte: request.quantity },
      },
      {
        $inc: { quantity: -request.quantity },
      }
    );

    if (!inventory) {
      return next(new AppError("Insufficient inventory", 400));
    }
  }

  res.status(200).json({
    status: "success",
    data: { request },
  });
});
