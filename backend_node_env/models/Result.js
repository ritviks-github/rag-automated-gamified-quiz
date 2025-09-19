// models/Result.js
const mongoose = require("mongoose");


const evaluationSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  score: {
    type: Number, // 0–1 or percentage
    required: true,
  },
  feedback: {
    type: String, // Explanation / reasoning from LLM
    required: false,
  },
});

const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  testId: {
    type: String,
    required: true,
  },
  responses: [
    {
      questionId: {
        type: String,
        required: true,
      },
      answer: mongoose.Schema.Types.Mixed, // string, number, array depending on type
    },
  ],
  evaluations: [evaluationSchema],
  overallScore: {
    type: Number, // optional: average or total score
    required: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a student can't submit the same test twice
resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
