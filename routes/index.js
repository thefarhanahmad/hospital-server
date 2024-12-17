const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const doctorRoutes = require("./doctorRoutes");
const hospitalRoutes = require("./hospitalRoutes");
const pharmacyRoutes = require("./pharmacyRoutes");
const pathologyRoutes = require("./pathologyRoutes");
const diagnosticRoutes = require("./diagnosticRoutes");
const bloodBankRoutes = require("./bloodBankRoutes");
const bulkOrderRoutes = require("./bulkOrderRoutes");
const advertisementRoutes = require("./advertisementRoutes");
const packageRoutes = require("./packageRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const notificationRoutes = require("./notificationRoutes");
const blogRoutes = require("./blogRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/hospitals", hospitalRoutes);


router.use("/bulk-order", bulkOrderRoutes);
router.use("/pharmacies", pharmacyRoutes);

router.use("/pathology", pathologyRoutes);
router.use("/diagnostic", diagnosticRoutes);
router.use("/blood-bank", bloodBankRoutes);

router.use("/ads", advertisementRoutes);
router.use("/packages", packageRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/blog", blogRoutes);

module.exports = router;
