const mongoose = require("mongoose");

const Resume = require("../models/Resume");
const Interview = require("../models/Interview");

const { generateInterviewQuestions } = require("../services/interviewService");

const { evaluateAnswer } = require("../services/answerEvaluationService");

// Generate Interview Questions
const createInterview = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId || !mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({
        message: "Please provide a valid resume ID",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const result = await generateInterviewQuestions(resume);

    if (!result.questions || result.questions.length === 0) {
      return res.status(500).json({
        message: "Questions could not be generated",
      });
    }

    const interview = await Interview.create({
      user: req.user.id,
      resume: resume._id,
      questions: result.questions,
    });

    res.status(201).json({
      message: "Interview questions generated successfully",
      interview,
    });
  } catch (error) {
    console.error("Interview Creation Error:", error.message);

    res.status(500).json({
      message: "Failed to create interview",
      error: error.message,
    });
  }
};

// Fetch Interview Questions
const getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        message: "Invalid interview ID",
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

    res.status(200).json({
      message: "Interview questions fetched successfully",
      interview,
    });
  } catch (error) {
    console.error("Fetch Interview Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch interview questions",
      error: error.message,
    });
  }
};

// Submit and Evaluate Answer
const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answer } = req.body;
    console.log("REQUEST BODY:", req.body);
    console.log("INTERVIEW ID:", interviewId);
    console.log("QUESTION ID:", questionId);
    console.log("VALID ID:", mongoose.isValidObjectId(interviewId));

    if (
      !mongoose.isValidObjectId(interviewId) ||
      !mongoose.isValidObjectId(questionId)
    ) {
      return res.status(400).json({
        message: "Invalid interview or question ID",
      });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        message: "Please provide an answer",
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

    const question = interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (question.answer) {
      return res.status(409).json({
        message: "Answer has already been submitted",
      });
    }

    // Evaluate answer using Gemini AI
    const evaluation = await evaluateAnswer(
      question.question,
      answer.trim(),
      question.category,
      question.difficulty,
    );
    // Save answer, score and feedback
    question.answer = answer.trim();
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;

    const allAnswered = interview.questions.every(
      (item) => item.answer && item.answer.trim(),
    );

    interview.status = allAnswered ? "Completed" : "In Progress";

    await interview.save();

    res.status(200).json({
      message: "Answer evaluated successfully",
      accepted: true,
      result: {
        question: question.question,
        answer: question.answer,
        score: question.score,
        feedback: question.feedback,
      },
      interviewStatus: interview.status,
    });
  } catch (error) {
    console.error("Answer Evaluation Error:", error.message);

    res.status(500).json({
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
};
// Fetch All Interviews of Logged-in User
const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
    })
      .populate("resume", "fileName")
      .sort({ createdAt: -1 });

    const formattedInterviews = interviews.map((interview) => {
      const answeredQuestions = interview.questions.filter(
        (question) => question.answer && question.answer.trim(),
      );

      const totalScore = answeredQuestions.reduce(
        (sum, question) => sum + (question.score || 0),
        0,
      );

      const averageScore = answeredQuestions.length
        ? Number((totalScore / answeredQuestions.length).toFixed(1))
        : 0;

      return {
        id: interview._id,
        role: interview.resume?.fileName || "Resume Interview",
        date: interview.createdAt,
        status: interview.status,
        score: averageScore,
      };
    });

    res.status(200).json(formattedInterviews);
  } catch (error) {
    console.error("Fetch My Interviews Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};
// Delete One Interview
const deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findOneAndDelete({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    res.status(200).json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete Interview Error:", error.message);

    res.status(500).json({
      message: "Failed to delete interview",
      error: error.message,
    });
  }
};

module.exports = {
  createInterview,
  getInterviewById,
  submitAnswer,
  getMyInterviews,
  deleteInterview,
};
