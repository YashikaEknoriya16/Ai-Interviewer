const mongoose = require("mongoose");

const Interview = require("../models/Interview");
const Report = require("../models/Report");

const { generateFinalReport } = require("../services/reportService");

// Generate Final Interview Report
const createReport = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        message: "Please provide a valid interview ID",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const allAnswered = interview.questions.every(
      (item) => item.answer && item.answer.trim(),
    );

    if (!allAnswered) {
      return res.status(400).json({
        message: "Please answer all interview questions first",
      });
    }

    // Check if report already exists
    const existingReport = await Report.findOne({
      interview: interview._id,
      user: req.user.id,
    });

    if (existingReport) {
      return res.status(200).json({
        message: "Interview report already exists",
        report: existingReport,
      });
    }

    // Calculate average score
    const totalScore = interview.questions.reduce(
      (total, item) => total + item.score,
      0,
    );

    const averageScore = Number(
      (totalScore / interview.questions.length).toFixed(2),
    );

    // Generate AI final feedback
    const aiReport = await generateFinalReport(interview, averageScore);

    // Save report in MongoDB
    const report = await Report.create({
      user: req.user.id,
      interview: interview._id,
      totalQuestions: interview.questions.length,
      answeredQuestions: interview.questions.filter(
        (item) => item.answer && item.answer.trim(),
      ).length,
      averageScore,
      overallFeedback: aiReport.overallFeedback,
      strengths: aiReport.strengths,
      improvements: aiReport.improvements,
      recommendation: aiReport.recommendation,
    });

    res.status(201).json({
      message: "Final interview report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Report Generation Error:", error.message);

    res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
    });
  }
};

module.exports = { createReport };
