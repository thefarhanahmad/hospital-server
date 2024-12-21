const express = require("express");
const blogController = require("../controllers/blogController");
const { protect, restrictTo } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");
const { blogValidation } = require("../validations/blogValidation");
const upload = require("../config/multer");

const router = express.Router();

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:slug", blogController.getBlogBySlug);

// Protected routes
router.use(protect);

router.post(
  "/",
  restrictTo("admin", "doctor"),
  validateRequest(blogValidation),
  upload.single("featuredImage"),
  blogController.createBlog
);

router.get("/author/me", blogController.getAuthorBlogs);

router
  .route("/:id")
  .patch(
    restrictTo("admin", "doctor"),
    validateRequest(blogValidation),
    blogController.updateBlog
  )
  .delete(restrictTo("admin", "doctor"), blogController.deleteBlog);

module.exports = router;
