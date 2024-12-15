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

// User profile routes
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;