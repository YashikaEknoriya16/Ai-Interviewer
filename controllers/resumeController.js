const Resume = require("../models/Resume");
const extractResumeText = require("../services/resumeParser");
const { analyzeResume } = require("../services/geminiService");
const fs = require("fs");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
      });
    }

    // Step 1: Extract text from PDF
    const resumeText = await extractResumeText(req.file.path);

    // Step 2: Analyze resume using Gemini AI
    const analysis = await analyzeResume(resumeText);

    // Step 3: Save resume and AI analysis in MongoDB
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      skills: analysis.skills || [],
      education: analysis.education || "",
      experience: analysis.experience || "",
      projects: analysis.projects || [],
      strengths: analysis.strengths || [],
    });

    res.status(201).json({
      message: "Resume uploaded and analyzed successfully",
      resume,
      analysis,
    });
  } catch (error) {
    // Remove uploaded file if processing fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error("File cleanup failed:", deleteError.message);
      }
    }

    res.status(500).json({
      message: "Resume processing failed",
      error: error.message,
    });
  }
};

module.exports = { uploadResume };
