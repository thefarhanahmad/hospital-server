const Notification = require("../models/Notification");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.sendNotification = catchAsync(async (req, res) => {
  const notification = await Notification.create({
    ...req.body,
    recipient: req.body.recipient || req.user._id,
  });

  // In a real application, you would also emit this via WebSocket
  // io.to(recipient).emit('notification', notification);

  res.status(201).json({
    status: "success",
    data: { notification },
  });
});

exports.getNotifications = catchAsync(async (req, res) => {
  // Parse and validate pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  if (page < 1 || limit < 1) {
    return res.status(400).json({
      status: "fail",
      message: "Page and limit must be positive integers.",
    });
  }

  const skip = (page - 1) * limit;

  // Fetch notifications for the user
  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: req.user._id }),
  ]);

  // Respond with paginated data
  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id,
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      read: false,
    },
    { read: true }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: notification,
  });
});
