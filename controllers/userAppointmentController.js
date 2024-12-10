const Appointment = require('../models/Appointment');
const TelemedicineSession = require('../models/TelemedicineSession');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.bookAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.create({
    ...req.body,
    user: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { appointment }
  });
});

exports.getAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('doctor', 'name specialization')
    .populate('hospital', 'name')
    .sort('-scheduledAt');

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: { appointments }
  });
});

exports.startTelemedicine = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  
  if (!appointment || appointment.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Appointment not found', 404));
  }

  const session = await TelemedicineSession.create({
    appointment: appointment._id,
    sessionType: req.body.sessionType,
    meetingLink: req.body.meetingLink
  });

  res.status(201).json({
    status: 'success',
    data: { session }
  });
});