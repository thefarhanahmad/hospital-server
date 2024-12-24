const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Contact = require("../models/contact")
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-__v");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.contact = async function(req, res) {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const newContact = new Contact({
      userId:req.user._id,
      name,
      email,
      phone,
      message,
    });
    await newContact.save();

    res.status(201).json({ message: "send message successfully!" });
  } catch (error) {
    console.error("Error creating contact:", error);
    res
      .status(500)
      .json({ error: "An error occurred. Please try again later." });
  }
}
