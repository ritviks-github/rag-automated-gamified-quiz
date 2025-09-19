import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useBodyClass from "../controllers/useBodyClass";
import { useEffect } from "react";

export default function Login() {
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
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      alert("Login successful!");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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
        <h2 className="text-center mb-4">Login</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
