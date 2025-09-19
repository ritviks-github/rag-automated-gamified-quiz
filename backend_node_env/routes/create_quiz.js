const express = require('express');
const Quiz = require('../models/Quiz.js');

const router = express.Router();

router.post("/create_quiz", async (req, res) => {
  try {
    const { roomId, professorId, questions } = req.body;

    if (!roomId || !professorId || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quiz = new Quiz({
      roomId,
      professorId,
      questions,
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz saved successfully!", quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving quiz" });
  }
});

module.exports = router;
