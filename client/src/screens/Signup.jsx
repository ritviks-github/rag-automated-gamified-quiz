import React, { useState } from "react";
import useBodyClass from "../controllers/useBodyClass";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

export default function Signup() {
  useBodyClass("auth-page");
  const navigate = useNavigate();
    useEffect(()=>{
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if(token){
        if(role == 'student'){
          navigate('/dashboard/students');
        }else{
          navigate('/dashboard/prof');
        }
      }
    },[]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "role" && type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        role: checked ? "professor" : "student",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8080/api/sign", formData);

      const { token, user } = res.data;

      // ✅ Store token + user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email);
      if(user.role == 'student'){
        navigate("/dashboard/students"); // redirect after signup
      }else{
        navigate('/dashboard/prof');
      }
      alert("Account created successfully!");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div
        className="card p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4">Create Account</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          {/* Role */}
          <div className="form-check my-3">
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

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Signing..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
