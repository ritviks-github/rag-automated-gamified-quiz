const express = require('express');
const router = express.Router();
const Result = require('../models/Result');


router.get('/get-student-responses', async (req, res) => {     

    const testId = req.query.testId; // From query params
    const studentId = req.query.studentId; // From query params

    if (!testId || !studentId) {
      return res.status(400).json({ error: "testId and studentId query parameters are required" });
    }
    try {
      const result = await Result.findOne({ testId, studentId }); // testId and studentId match schema

      if (!result) {
        return res.status(404).json({ error: "No responses found for the given testId and studentId" });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching student responses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;