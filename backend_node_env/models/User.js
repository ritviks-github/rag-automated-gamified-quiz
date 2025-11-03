const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Role: student or professor
    role: {
      type: String,
      enum: ["student", "professor"],
      default: "student",
    },

    // Extra Profile Info
    institution: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    rollNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    course: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    semester: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Invalid phone number format"],
    },

    // Store image as base 64 string
    profilePic: {
      data: Buffer, // binary image data
      contentType: String, // e.g. "image/jpeg" or "image/png"
    },

    // Terms acceptance
    acceptTerms: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;