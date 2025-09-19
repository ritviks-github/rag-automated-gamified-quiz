// routes/quiz.js
const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

// GET quiz by roomId
router.get("/get-quiz/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const quiz = await Quiz.findOne({ roomId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ questions: quiz.questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
