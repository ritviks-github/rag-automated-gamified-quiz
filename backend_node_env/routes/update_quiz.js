const express = require('express');
const Quiz = require('../models/Quiz.js');

const router = express.Router();

// Update an existing quiz by roomId
router.put("/update_quiz/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions array is required" });
    }

    const quiz = await Quiz.findOne({ roomId });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Update questions
    quiz.questions = questions;

    await quiz.save();

    res.status(200).json({ message: "Quiz updated successfully!", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating quiz" });
  }
});

module.exports = router;