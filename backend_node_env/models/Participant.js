const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  quizRoomId: { type: String, required: true }, // same as Quiz.roomId
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedAt: { type: Date, default: Date.now },
});

participantSchema.index({ quizRoomId: 1, studentId: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model("Participant", participantSchema);
