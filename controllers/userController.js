const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Contact = require("../models/contact");
const cart = require("../models/Cart");
const PharmacyBill = require("../models/PharmacyBill");
const Razorpay = require("razorpay");
const PharmacyInventory = require("../models/PharmacyInventory");
const fixedAppoinments = require("../models/fixedAppoinments");
const drAppoinmentModel = require("../models/drAppointment");
const drmodel = require("../models/Doctor");
const seckeyId = "rzp_test_S94PkPDE4dpiOy";
const seckey = "FkPWzsLPpEW4ux0WGzf4ki6Q";

const razorpay = new Razorpay({
  key_id: seckeyId,
  key_secret: seckey,
});
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
//proced to checkout user hit
exports.createBill = catchAsync(async (req, res, next) => {
  const { items, prescription, paymentMethod } = req.body;

  let subtotal = 5000;
  const validatedItems = [];
  let pharmacyId;

  for (const item of items) {
    const inventory = await PharmacyInventory.findOne({
      medicineId: item.medicineId,
    });

    if (!inventory) {
      return next(new AppError("Invalid inventory item", 400));
    }

    pharmacyId = inventory.pharmacyId;

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

  const tax = subtotal * 0.18;
  const totalDiscount = validatedItems.reduce(
    (acc, item) => acc + item.discount,
    0
  );
  const total = subtotal + tax - totalDiscount;

  // Create a Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: total * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  if (!razorpayOrder) {
    return next(new AppError("Failed to create Razorpay order", 500));
  }

  const bill = await PharmacyBill.create({
    pharmacyId: pharmacyId,
    patient: req.user._id,
    prescription,
    items: validatedItems,
    subtotal,
    tax,
    totalDiscount,
    total,
    paymentMethod,
    razorpayOrderId: razorpayOrder.id,
    status: "pending", // Initially pending until payment is verified
  });

  res.status(201).json({
    status: "success",
    data: { bill, razorpayOrder },
  });
});
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const crypto = require("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  s;

  if (generatedSignature !== razorpay_signature) {
    return next(new AppError("Payment verification failed", 400));
  }

  const bill = await PharmacyBill.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { status: "completed", razorpayPaymentId: razorpay_payment_id },
    { new: true }
  );

  if (!bill) {
    return next(new AppError("Bill not found for the provided order ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Payment verified successfully",
    data: { bill },
  });
});

/* --------------------------------shedule Apointment with dr------------------------------- */
exports.bookAppoinment = catchAsync(async (req, res) => {
  try {
    const { doctorID, date, time, slotId } = req.body;
    const chekIsAlredyAppoinment = await fixedAppoinments.find({
      patient: req.user._id,
      date: date,
      time: time,
      doctorId: doctorID,
    });

    if (chekIsAlredyAppoinment.paid) {
      return res.status(400).send({
        success: false,
        message: "Appoinment alredy sheduled ",
        data: {
          date: chekIsAlredyAppoinment.date,
          amount: chekIsAlredyAppoinment.time,
        },
      });
    }

    const ChekISSlotAlredyBook = await drAppoinmentModel.findOne({
      doctorId: doctorID,
      date: date,
    });

    if (ChekISSlotAlredyBook) {
      const { hourlyAvailability } = ChekISSlotAlredyBook;

      const filterSlots = hourlyAvailability.filter((val) => val._id == slotId);

      if (filterSlots.isBooked || !filterSlots.isActive) {
        return res
          .status(404)
          .send({ message: "This Slot is Alredy booked plese Choose another" });
      }

      const getDrFees = await drmodel.findOne({ userId: doctorID });
      const { fees } = getDrFees;
      const razorpayOrder = await razorpay.orders.create({
        amount: fees * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      await fixedAppoinments.create({
        doctorId: doctorID,
        patient: req.user._id,
        orderId: razorpayOrder.id,
        status: "created",
        date: new Date(date),
        time: time,
        slot: slotId,
        paid: false,
        Amount: fees,
      });

      return res.status(201).send({
        message: "order created sucessfully",
        data: {
          orderId: razorpayOrder.id,
          currency: "INR",
          amount: razorpayOrder.amount,
          keyId: seckeyId,
          KeySecret: seckey,
        },
      });
    }
  } catch (error) {}
});

exports.verifyAppoinmentPayment = catchAsync(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const crypto = require("crypto");

  // Generate the HMAC signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Verify the generated signature with the received signature
  if (generatedSignature !== razorpay_signature) {
    return next(new AppError("Payment verification failed", 400));
  }

  // Update the appointment payment status
  const confirmAppoinment = await fixedAppoinments.findOneAndUpdate(
    {
      patient: req.user._id,
      orderId: razorpay_order_id,
    },
    { status: "success", paid: true },
    { new: true }
  );

  if (!confirmAppoinment) {
    return next(new AppError("Appointment not found or already updated", 404));
  }

  const { doctorId, patient, date, slot } = confirmAppoinment;

  // Find the doctor's appointment schedule
  const existingAppointment = await DoctorAppointment.findOne({
    doctorId,
    date: new Date(date),
  });

  if (!existingAppointment) {
    return next(new AppError("Doctor's schedule not found", 404));
  }

  const existingSlots = existingAppointment.hourlyAvailability;

  // Update the booked slot
  const newUpdatedSlots = existingSlots.map((e) => {
    if (e._id.toString() === slot.toString()) {
      return {
        ...e,
        isBooked: true,
        patientId: patient,
      };
    }
    return e;
  });

  // Save the updated slots to the database
  existingAppointment.hourlyAvailability = newUpdatedSlots;
  const updatedAppointment = await existingAppointment.save();

  res.status(200).json({
    status: "success",
    message: "Payment verified successfully",
    data: {
      appointment: confirmAppoinment,
      updatedSchedule: updatedAppointment,
    },
  });
});
