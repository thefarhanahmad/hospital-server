const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();
router.use(protect);

router.use(restrictTo("admin"));
const uploadFields = [{ name: "hospitalImages", maxCount: 10 }];

router.get(
  "/all-hospitals",
  adminController.getAllHospital
)
router.get("/all-users",adminController.getAllUsers)
router.post("/create-user",adminController.createUser);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;

