const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const axios = require('axios');


router.get('/collect-answers', async (req, res) => {
  const testId = req.query.testId; // From query params

  if (!testId) {
    return res.status(400).json({ error: "testId query parameter is required" });
  }

  try {
    const results = await Result.find({ testId }); // testId matches schema
    const quiz = await Quiz.findOne({ roomId: testId });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found for the given testId" });
    }

    const formattedResponses = results.map(result => ({
      studentId: result.studentId,
      testId: result.testId,
      responses: result.responses.map(r => ({
        questionId: r.questionId,
        answer: r.answer
      }))
    }));

    const highestScorer = results.reduce((top, curr) => {
      if (!top || curr.overallScore > top.overallScore) {
        return curr;
      }
      return top;
    }, null);

    const payload = {
      testId,
      quiz,
      highestScorerId: highestScorer ? highestScorer.studentId : null,
      allResponses: formattedResponses
    };

    const PYTHON_API_URL = 'http://localhost:8000/normalize-scores';

    const response = await axios.post(PYTHON_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000, // 5 min (if embeddings/LLM take time)
    });

    const normalizedResults = response.data;

   if (normalizedResults.status === "success" && normalizedResults.normalizedResults) {
      const updatePromises = normalizedResults.normalizedResults.map(async (student) => {
        const evaluations = student.responses.map(r => ({
          questionId: r.questionId,
          score: r.normalizedScore, // normalized value from Python
          feedback: "", // optional (can add later)
        }));

        // ✅ total score = sum of normalized scores
        const overall = evaluations.reduce((sum, e) => sum + e.score, 0);

        return Result.updateOne(
          { studentId: student.studentId, testId },
          {
            $set: {
              evaluations,
              overallScore: overall,
            },
          }
        );
      });
      await Result.updateMany({ testId }, { $set: { normalized: true } });


      await Promise.all(updatePromises);
    }

    res.json({
      status: "success",
      normalizedResults: normalizedResults.normalizedResults || [],
    });
  } catch (err) {
    console.error('Error in /collect-answers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
