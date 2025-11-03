import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import useBodyClass from "../controllers/useBodyClass";

export default function Login() {
  useBodyClass("auth-page");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) navigate(role === "student" ? "/dashboard/students" : "/dashboard/prof");
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/login", formData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);

      navigate(user.role === "student" ? "/dashboard/students" : "/dashboard/prof");
      alert("Login successful!");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card border-0 shadow-lg p-4" style={{ width: "420px", borderRadius: "20px" }}>
        {/* Logo / Avatar */}
        <div className="text-center mb-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
            alt="login icon"
            width="90"
            height="90"
            className="rounded-circle border border-2 border-secondary-subtle mb-2"
          />
          <h3 className="fw-bold mb-1">Welcome Back 👋</h3>
          <p className="text-muted small mb-0">Login to continue your tests</p>
        </div>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email address</label>
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
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => setShowPassword(!showPassword)}
              style={{ fontSize: "0.8rem" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center mt-4 mb-0 small">
          Don’t have an account?{" "}
          <Link to="/signup" className="fw-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
