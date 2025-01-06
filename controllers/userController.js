const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Contact = require("../models/contact");
const cart = require("../models/Cart");

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

exports.contact = async function (req, res) {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const newContact = new Contact({
      userId: req.user._id,
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
};

// exports.addMedicineToCart = (req, res) => {
//   const { user_id, medicine_id, quantity } = req.body;

//   if (!user_id || !medicine_id || !quantity) {
//     return res
//       .status(400)
//       .json({
//         success: false,
//         message: "user_id, medicine_id, and quantity are required",
//       });
//   }

//   if (isNaN(quantity) || quantity <= 0) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Quantity must be a positive number" });
//   }
//   if (!carts[user_id]) {
//     carts[user_id] = [];
//   }
//   const existingMedicineIndex = carts[user_id].findIndex(
//     (item) => item.medicine_id === medicine_id
//   );

//   if (existingMedicineIndex >= 0) {
//     carts[user_id][existingMedicineIndex].quantity += quantity;
//   } else {
//     carts[user_id].push({ medicine_id, quantity });
//   }

//   return res.json({
//     success: true,
//     message: "Medicine added to cart successfully",
//     cart: carts[user_id],
//   });
// };

exports.addToCart = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity } = req.body;

    const cartData = await cart.create({
      userId: req.user._id,
      medicineId: medicineId,
      quantity: quantity,
    });
    return res.status(201).send({
      success: true,
      message: "cart added successfully",
      data: cartData,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!id || !quantity) {
      return res.status(400).send({
        success: false,
        message: "ID and quantity are required.",
      });
    }

    const cartData = await cart.findOneAndUpdate(
      { _id: id },
      { quantity: quantity },
      { new: true }
    );
    if (!cartData) {
      return res.status(404).send({
        success: false,
        message: "Cart item not found.",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Cart updated successfully.",
      data: cartData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "error in updating the cart.",
    });
  }
};

exports.deleteToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cartData = await cart.findByIdAndDelete(id);
    return res.status(200).send({
      success: true,
      message: "cart deleted successfully",
      data: cartData,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getAllCart = async (req, res) => {
  try {
    const cartData = await cart.find();
    if (!cartData) {
      return res.status(400).send({
        success: false,
        message: "No cart Available",
        data: cartData,
      });
    }
    return res.status(200).send({
      success: true,
      message: "All cart retrieved Successfully",
      data: cartData,
    });
  } catch (error) {
    console.log(error);
  }
};

