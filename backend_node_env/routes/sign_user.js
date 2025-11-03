const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = "your_secret_key";

// POST /api/sign
router.post("/sign", upload.single("profilePic"), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      institution,
      rollNumber,
      course,
      semester,
      phone,
      acceptTerms,
    } = req.body;

    // validate mandatory fields
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password are required." });

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists." });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // prepare image data
    let profilePic = {};
    if (req.file) {
      profilePic = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      institution,
      rollNumber,
      course,
      semester,
      phone,
      acceptTerms,
      profilePic,
    });

    await newUser.save();

    // generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;