const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        category: {
          type: String,
          default: "Technical",
        },

        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          default: "Medium",
        },

        answer: {
          type: String,
          default: "",
        },

        score: {
          type: Number,
          min: 0,
          max: 10,
          default: null,
        },

        feedback: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: ["Generated", "In Progress", "Completed"],
      default: "Generated",
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
