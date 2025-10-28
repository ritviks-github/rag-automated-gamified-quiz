const express = require("express");
const router = express.Router();
const Result = require("../models/Result");

router.get("/check-normalization", async (req, res) => {
  const { testId } = req.query;
  if (!testId) return res.status(400).json({ error: "testId required" });

  try {
    const countTotal = await Result.countDocuments({ testId });
    const countNormalized = await Result.countDocuments({ testId, normalized: true });

    res.json({ 
      testId,
      normalized: countTotal > 0 && countTotal === countNormalized 
    });
  } catch (err) {
    console.error("Error checking normalization:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;