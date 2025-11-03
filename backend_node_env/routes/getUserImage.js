const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

// ✅ Route to fetch user image
router.get("/user_image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(id).select("profilePic");

    if (!user || !user.profilePic || !user.profilePic.data) {
      return res.status(404).json({ error: "User image not found" });
    }

    // ✅ Set correct MIME type and send raw binary buffer
    res.set("Content-Type", user.profilePic.contentType || "image/jpeg");
    res.send(user.profilePic.data);
  } catch (error) {
    console.error("Error fetching user image:", error);
    res.status(500).json({ error: "Server error fetching user image" });
  }
});

module.exports = router;
