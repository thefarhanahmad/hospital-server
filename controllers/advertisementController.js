const Advertisement = require("../models/Advertisement");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Upload advertisement
exports.uploadAd = catchAsync(async (req, res) => {
  const ad = await Advertisement.create({
    ...req.body,
    advertiser: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { ad },
  });
});

exports.getAds = catchAsync(async (req, res) => {
  // const { location, page } = req.query;
  // console.log("Query Parameters - Location:", location, "Page:", page);
  // const now = new Date();

  // const query = {
  //   status: "active",
  //   startDate: { $lte: now },
  //   endDate: { $gte: now },
  // };

  // // Ensure correct filtering for location and page
  // if (location) {
  //   query["targeting.locations"] = { $in: [location] }; // Match one of the locations
  // }

  // if (page) {
  //   query["placement.pages"] = { $in: [page] }; // Match one of the pages
  // }

  // console.log("Generated Query:", query);

  // const ads = await Advertisement.find(query)
  //   .sort("-placement.priority")
  //   .select("-__v");
  const ads = await Advertisement.find();
  console.log("Ads Found:", ads);

  // Update impression count for found ads
  if (ads.length > 0) {
    await Advertisement.updateMany(
      { _id: { $in: ads.map((ad) => ad._id) } },
      { $inc: { "metrics.impressions": 1 } }
    );
  }

  res.status(200).json({
    status: "success",
    results: ads.length,
    data: { ads },
  });
});

// Track ad click
exports.trackClick = catchAsync(async (req, res, next) => {
  const ad = await Advertisement.findById(req.params.id);

  if (!ad) {
    return next(new AppError("Advertisement not found", 404));
  }

  ad.metrics.clicks += 1;
  await ad.save();

  res.status(200).json({
    status: "success",
    data: { redirectUrl: ad.targetUrl },
  });
});

// Get advertiser's ads
exports.getAdvertiserAds = catchAsync(async (req, res) => {
  const ads = await Advertisement.find({ advertiser: req.user._id }).sort(
    "-createdAt"
  );

  res.status(200).json({
    status: "success",
    results: ads.length,
    data: { ads },
  });
});

// Update ad status (admin only)
exports.updateAdStatus = catchAsync(async (req, res, next) => {
  const ad = await Advertisement.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ad) {
    return next(new AppError("Advertisement not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { ad },
  });
});
