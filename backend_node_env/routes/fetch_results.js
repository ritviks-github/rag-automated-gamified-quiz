const express = require('express');
const router = express.Router();
const Result = require('../models/Result');



router.get("/results/:testId", async (req, res) => {
  try {
    const { testId } = req.params;
    const results = await Result.find({testId}, { studentId: 1, overallScore: 1 })
      .sort({ overallScore: -1 });

    // Assign ranks
    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      userId: r.studentId,
      score: r.overallScore
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;