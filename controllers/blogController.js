const Blog = require("../models/Blog");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createBlog = catchAsync(async (req, res) => {
  // Extracting fields from the request body
  console.log("blog data from req body : ", req);
  const { title, content, category, tags, meta, status } = req.body;

  // Ensure required fields are present
  if (!title || !content || !category || !status) {
    return res.status(400).json({
      status: "fail",
      message: "Title, content, category, and status are required.",
    });
  }

  // Prepare the blog data
  const blogData = {
    title,
    content,
    category,
    tags: tags,
    meta: meta,
    status,
    author: req.user._id, // Assuming the user is logged in and req.user contains user info
  };

  // Check if an image was uploaded
  if (req.file) {
    blogData.featuredImage = {
      url: req.file.path, // Cloudinary URL of the uploaded image
      alt: req.body.imageAlt || "Featured image", // Optional alt text for the image
    };
  }

  // Create the blog post in the database
  const blog = await Blog.create(blogData);

  // Respond with the created blog data
  res.status(201).json({
    status: "success",
    data: { blog },
  });
});

exports.getAllBlogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { status: "published" };

  // Apply filters
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.tag) {
    query.tags = req.query.tag;
  }

  const blogs = await Blog.find(query)
    .populate("author", "name")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    },
  });
});

exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOneAndUpdate(
    {
      slug: req.params.slug,
      status: "published",
    },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", "name");

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { blog },
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOneAndUpdate(
    {
      _id: req.params.id,
      author: req.user._id,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { blog },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });

  if (!blog) {
    return next(new AppError("Blog not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAuthorBlogs = catchAsync(async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: { blogs },
  });
});
