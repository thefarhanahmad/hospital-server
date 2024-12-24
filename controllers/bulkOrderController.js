const BulkOrder = require("../models/BulkOrder");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createBulkMedicineOrder = catchAsync(async (req, res) => {
  const { items, supplier, deliveryAddress, expectedDeliveryDate } = req.body;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax - (req.body.discount || 0);

  const order = await BulkOrder.create({
    orderedBy: req.user.hospital || req.user._id,
    ordererType: "Hospital",
    orderType: "medicine",
    items,
    supplier,
    supplierType: "Pharmacy",
    deliveryAddress,
    expectedDeliveryDate,
    subtotal,
    tax,
    discount: req.body.discount || 0,
    total,
    paymentTerms: req.body.paymentTerms,
    remarks: req.body.remarks,
  });

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.createBulkReagentOrder = catchAsync(async (req, res) => {
  const { items, supplier, deliveryAddress, expectedDeliveryDate } = req.body;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax - (req.body.discount || 0);

  const order = await BulkOrder.create({
    orderedBy: req.user.pathlab || req.user._id,
    ordererType: "PathologyLab",
    orderType: "reagent",
    items,
    supplier,
    supplierType: "Supplier",
    deliveryAddress,
    expectedDeliveryDate,
    subtotal,
    tax,
    discount: req.body.discount || 0,
    total,
    paymentTerms: req.body.paymentTerms,
    remarks: req.body.remarks,
  });

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.createBulkSupplyOrder = catchAsync(async (req, res) => {
  const { items, supplier, deliveryAddress, expectedDeliveryDate } = req.body;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax - (req.body.discount || 0);

  const order = await BulkOrder.create({
    orderedBy: req.user.diagnostic || req.user._id,
    ordererType: "Diagnostic",
    orderType: "supply",
    items,
    supplier,
    supplierType: "Supplier",
    deliveryAddress,
    expectedDeliveryDate,
    subtotal,
    tax,
    discount: req.body.discount || 0,
    total,
    paymentTerms: req.body.paymentTerms,
    remarks: req.body.remarks,
  });

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.getBulkOrders = catchAsync(async (req, res) => {
  const orders = await BulkOrder.find({
    orderedBy:
      req.user.hospital ||
      req.user.pathlab ||
      req.user.diagnostic ||
      req.user._id,
  })
    // .populate("supplier")
    // .populate("items.item")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});