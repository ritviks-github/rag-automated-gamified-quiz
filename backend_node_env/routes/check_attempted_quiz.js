const express = require('express');
const router = express.Router();
const Result = require('../models/Result');


router.get("/check-attempted-quiz", async (req, res) => {
  const { studentId, testId } = req.query;
  if (!studentId || !testId) return res.status(400).json({ message: "Missing parameters" });

  try {
    const existing = await Result.findOne({ studentId, testId });
    res.json({ attempted: !!existing }); // true if found
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;