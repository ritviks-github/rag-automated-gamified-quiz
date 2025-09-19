const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');



router.get('/get-all-quizzes',async (req,res)=>{
    try {
    const { professorId } = req.query;
    if (!professorId) {
      return res.status(400).json({ error: 'professorId is required' });
    }

    const quizzes = await Quiz.find({ professorId })
      .sort({ createdAt: -1 }); // newest first

    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;