const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInterview,
  getInterviewById,
  submitAnswer,
  getMyInterviews,
  deleteInterview,
} = require("../controllers/interviewController");

// Generate interview questions
router.post("/generate", protect, createInterview);

// Submit and evaluate answer
router.post("/answer", protect, submitAnswer);

// Fetch all interviews of logged-in user
router.get("/my", protect, getMyInterviews);

// Delete one interview
router.delete("/:interviewId", protect, deleteInterview);

// Fetch interview questions by ID
router.get("/:interviewId", protect, getInterviewById);

module.exports = router;
