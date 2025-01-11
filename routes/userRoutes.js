const express = require("express");
const userController = require("../controllers/userController");
const userAppointmentController = require("../controllers/userAppointmentController");
const userOrderController = require("../controllers/userOrderController");

const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  appointmentRules,
  telemedicineRules,
  orderRules,
  testBookingRules,
} = require("../validations/userValidation");

const router = express.Router();
// Protected routes
router.use(protect);
// Appointment routes
router.post(
  "/appointment",
  validateRequest(appointmentRules),
  userAppointmentController.bookAppointment
);

router.get("/appointments", userAppointmentController.getAppointments);
// Telemedicine routes
router.post(
  "/telemedicine/:appointmentId",
  validateRequest(telemedicineRules),
  userAppointmentController.startTelemedicine
);
router.post(
  "/payment",
  // validateRequest(billCreationRules),
  userController.createBill
);
router.post(
  "/verify-payment",
  userController.verifyPayment
);
// Medicine order routes
router.post(
  "/order-medicine",
  validateRequest(orderRules),
  userOrderController.orderMedicine
);
router.get("/orders", userOrderController.getOrders);
// Diagnostic test routes
router.post(
  "/book-test",
  validateRequest(testBookingRules),
  userOrderController.bookTest
);
router.get("/test-results", userOrderController.getTestResults);
router.post("/contact", userController.contact);
router.post("/cart", userController.addToCart);
router.delete("/cart/:id", userController.deleteToCart);
router.patch("/cart/:id", userController.updateToCart);
router.get("/all-carts", userController.getAllCart);

// User profile routes
module.exports = router;
