import React, { useState, useEffect } from "react";
import useBodyClass from "../controllers/useBodyClass";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  useBodyClass("auth-page");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) navigate(role === "student" ? "/dashboard/students" : "/dashboard/prof");
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    institution: "",
    rollNumber: "",
    course: "",
    semester: "",
    phone: "",
    profilePic: null,
    acceptTerms: false,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profilePic: file }));
      setPreview(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      if (name === "role") {
        setFormData((prev) => ({
          ...prev,
          role: checked ? "professor" : "student",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Frontend Validations
    if (!formData.profilePic) return setError("Please upload your profile picture.");
    if (!formData.institution.trim()) return setError("Institution name is required.");
    if (!formData.rollNumber.trim()) return setError("Roll number is required.");
    if (!formData.course.trim()) return setError("Course name is required.");
    if (!formData.semester.trim()) return setError("Please select your semester/year.");
    if (!formData.phone.trim()) return setError("Phone number is required.");
    if (!formData.acceptTerms)
      return setError("You must accept the terms & privacy policy.");

    // Basic format check for phone number
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(formData.phone))
      return setError("Please enter a valid phone number (10-15 digits).");

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });

      const res = await axios.post("http://localhost:8080/api/sign", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);

      navigate(user.role === "student" ? "/dashboard/students" : "/dashboard/prof");
      alert("Account created successfully!");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Signup failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card border-0 shadow-lg p-4"
        style={{ width: "430px", borderRadius: "20px" }}
      >
        {/* Profile Picture */}
        <div className="text-center mb-4">
          <img
            src={preview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="Preview"
            className="rounded-circle mb-3 border border-2 border-secondary-subtle"
            width="90"
            height="90"
          />
          <div>
            <label className="btn btn-outline-secondary btn-sm position-relative">
              Upload Photo
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="position-absolute top-0 start-0 opacity-0 w-100 h-100"
                required
              />
            </label>
          </div>
        </div>

        <h3 className="text-center fw-bold mb-1">Create Account</h3>
        <p className="text-center text-muted mb-4">
          Join to access your online class tests
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </div>

          {/* Institution */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Institution</label>
            <input
              type="text"
              className="form-control"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="College or School name"
              required
            />
          </div>

          {/* Roll & Course */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Roll Number</label>
              <input
                type="text"
                className="form-control"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g. 23CS001"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Course</label>
              <input
                type="text"
                className="form-control"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. B.Tech CSE"
                required
              />
            </div>
          </div>

          {/* Semester */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Semester / Year</label>
            <select
              name="semester"
              className="form-select"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={`${i + 1}`}>
                  {i + 1} {i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          {/* Role */}
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="prof"
              name="role"
              checked={formData.role === "professor"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="prof">
              I'm a Professor
            </label>
          </div>

          {/* Terms */}
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="terms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            <label className="form-check-label small text-muted" htmlFor="terms">
              I agree to the <Link to="/terms-and-privacy">Terms</Link> &{" "}
              <Link to="/terms-and-privacy">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
