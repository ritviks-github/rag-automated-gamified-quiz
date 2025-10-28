const mongoose = require('mongoose');
// Question schema
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    enum: ["mcq", "subjective"],
    required: true,
  },

  // For MCQ
  options: [{ type: String }],
  correctAnswers: [{ type: Number }], // indices of correct options

  // Timer field
  timeLimit: { type: Number, required: true }, // in seconds
});

// Main Quiz schema
const quizSchema = new mongoose.Schema(
  {
    roomId: {
      type: String, // UUID sent from frontend
      unique: true,
      required: true,
    },
    professorId: {
      type: String, // passed directly from frontend
      required: true,
    },
    questions: [questionSchema],
    quizStarted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =  mongoose.model("Quiz", quizSchema);
