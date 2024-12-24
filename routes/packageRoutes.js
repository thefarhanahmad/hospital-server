const express = require("express");
const packageController = require("../controllers/packageController");
const router = express.Router();
router.get("/all-package", packageController.getUserPackages);
module.exports = router;
