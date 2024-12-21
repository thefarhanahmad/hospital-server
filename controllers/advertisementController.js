const Advertisement = require("../models/Advertisement");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAdvertisement = catchAsync(async (req, res, next) => {
  // Extracting fields from the request body
  const {
    title,
    description,
    imageUrl,
    targetUrl,
    type,
    startDate,
    endDate,
    targeting,
    metrics,
    placement,
    status = "pending", // Default status to "pending" if not provided
  } = req.body;

  // Ensure required fields are present
  if (
    !title ||
    !description ||
    !targetUrl ||
    !type ||
    !startDate ||
    !endDate ||
    !placement
  ) {
    return next(
      new AppError(
        "Title, description, targetUrl, type, startDate, endDate, and placement are required.",
        400
      )
    );
  }

  // Validate that startDate is in the future and endDate is after startDate
  const currentDate = new Date();
  if (new Date(startDate) < currentDate) {
    return next(new AppError("Start date must be in the future.", 400));
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return next(new AppError("End date must be after start date.", 400));
  }

  // Prepare the advertisement data based on schema
  const adData = {
    title,
    description,
    targetUrl,
    type,
    startDate,
    endDate,
    targeting,
    metrics: metrics || { impressions: 0, clicks: 0 }, // Default metrics if not provided
    placement,
    status,
    advertiser: req.user._id, // Assuming the user is logged in and req.user contains user info
  };

  // Check if an image was uploaded, otherwise use imageUrl from body
  if (req.file) {
    adData.imageUrl = req.file.path; // Assuming the uploaded image path is stored in req.file.path
  } else if (imageUrl) {
    adData.imageUrl = imageUrl; // Use the provided imageUrl if no file was uploaded
  }

  // Create the advertisement in the database
  const ad = await Advertisement.create(adData);

  // Respond with the created advertisement data
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
  console.log("req body status : ", req.body);
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
