const express = require("express");
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  notificationValidation,
} = require("../validations/notificationValidation");

const router = express.Router();

router.use(protect);

router.post(
  "/send",
  validateRequest(notificationValidation),
  notificationController.sendNotification
);


router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
