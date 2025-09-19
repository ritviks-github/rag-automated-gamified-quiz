// routes/results.js
const express = require("express");
const router = express.Router();
const Result = require("../models/Result");
const Quiz = require('../models/Quiz');
const axios = require('axios');

// Save student result
router.post("/submit-quiz", async (req, res) => {
  const { studentId, testId, responses } = req.body;

  if (!studentId || !testId || !responses) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newResult = new Result({
      studentId,
      testId,
      responses,
    });
    await newResult.save();
    const quiz = await Quiz.findOne({ roomId: testId });
    try {
      const pythonResponse = await axios.post("http://localhost:8000/evaluate-quiz", {
        quiz: quiz,             // full quiz data
        result: newResult       // saved result data
      });

      const { evaluations, overallScore } = pythonResponse.data;

      // 4. Save evaluations + overall score back into MongoDB
      if (evaluations) {
        newResult.evaluations = evaluations;
        newResult.overallScore = overallScore;  // add overallScore field
        await newResult.save();
      }

      // 5. Respond to frontend
      res.status(201).json({
        message: "Result submitted and sent for evaluation",
        evaluation: pythonResponse.data
      });

    } catch (pythonErr) {
      console.error("[EVAL ERROR]", pythonErr.message);
      res.status(201).json({
        message: "Result submitted, but evaluation failed",
        evaluationError: pythonErr.message
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Test already submitted by this student" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
