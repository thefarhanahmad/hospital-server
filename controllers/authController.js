const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const {
    username,
    name,
    email,
    password,
    role,
    phone,
    dateOfBirth,
    gender,
    address = {},
  } = req.body;

  const alreadyEmail = await User.findOne({ email: email });
  if (alreadyEmail) {
    return res.json({
      message: "User already exists",
    });
  }
  const newUser = await User.create({
    name: name,
    username: username,
    email: email,
    password: password,
    role: role,
    phone: phone,
    dateOfBirth: dateOfBirth,
    gender: gender,
    address: address,
  });
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   role: req.body.role,
  //   phone: req.body.phone,
  //   dateOfBirth: req.body.dateOfBirth,
  //   gender: req.body.gender,
  //   address: req.body.address,
  // });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});
