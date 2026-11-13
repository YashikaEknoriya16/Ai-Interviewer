const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { createReport } = require("../controllers/reportController");

// Generate Final Interview Report
router.post("/generate", protect, createReport);

module.exports = router;
