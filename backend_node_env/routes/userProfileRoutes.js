const express = require("express");
const router = express.Router();
const User = require("../models/User");


router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error fetching user data" });
  }
});

module.exports = router;
