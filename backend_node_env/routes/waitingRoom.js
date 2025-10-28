const express = require("express");
const Participant = require("../models/Participant");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

const router = express.Router();

// 🧩 Join Quiz (student)
router.post("/join-quiz", async (req, res) => {
  try {
    const { quizId, studentId } = req.body;

    const quiz = await Quiz.findOne({ roomId: quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Add participant if not already joined
    await Participant.findOneAndUpdate(
      { quizRoomId: quizId, studentId },
      { quizRoomId: quizId, studentId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Joined quiz successfully" });
  } catch (err) {
    console.error("Join quiz error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🧠 Get Room Status (participants + quizStarted)
router.get("/get-room-status/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const quiz = await Quiz.findOne({ roomId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Fetch participants
    const participants = await Participant.find({ quizRoomId: roomId }).populate(
      "studentId",
      "name email"
    );

    res.json({
      participants: participants.map((p) => ({
        id: p.studentId._id,
        name: p.studentId.name,
        email: p.studentId.email,
      })),
      quizStarted: quiz.quizStarted || false,
    });
  } catch (err) {
    console.error("Get room status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🧑‍🏫 Start Quiz (professor)
router.post("/start-quiz", async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findOne({ roomId: quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Add quizStarted flag dynamically
    quiz.quizStarted = true;
    await quiz.save();

    res.json({ message: "Quiz started successfully" });
  } catch (err) {
    console.error("Start quiz error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
