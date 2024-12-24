const Subscription = require('../models/Subscription');
const Package = require('../models/Package');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createSubscription = catchAsync(async (req, res, next) => {
  const { packageId, billingCycle } = req.body;

  // Validate package
  const package = await Package.findById(packageId);
  if (!package || !package.active) {
    return next(new AppError('Invalid or inactive package', 400));
  }

  // Calculate dates and amount
  const startDate = new Date();
  const endDate = new Date();
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const amount = billingCycle === 'monthly' ? 
    package.price.monthly : 
    package.price.yearly;

  const subscription = await Subscription.create({
    user: req.user._id,
    package: packageId,
    startDate,
    endDate,
    billingCycle,
    amount,
    usage: {
      appointments: { limit: package.limits.appointments },
      orders: { limit: package.limits.orders },
      reports: { limit: package.limits.reports },
      storage: { limit: package.limits.storage }
    }
  });

  res.status(201).json({
    status: 'success',
    data: { subscription }
  });
});

exports.getCurrentSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  }).populate('package');

  res.status(200).json({
    status: 'success',
    data: { subscription }
  });
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOneAndUpdate(
    {
      user: req.user._id,
      status: 'active'
    },
    {
      status: 'cancelled',
      autoRenew: false
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { subscription }
  });
});

exports.updateUsage = catchAsync(async (req, res, next) => {
  const { type, increment } = req.body;

  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active'
  });

  if (!subscription) {
    return next(new AppError('No active subscription found', 404));
  }

  const usageField = `usage.${type}.used`;
  const limitField = `usage.${type}.limit`;

  if (subscription.usage[type].used + increment > subscription.usage[type].limit) {
    return next(new AppError(`Usage limit exceeded for ${type}`, 400));
  }

  subscription.usage[type].used += increment;
  await subscription.save();

  res.status(200).json({
    status: 'success',
    data: { subscription }
  });
});

