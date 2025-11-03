import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId, token]);

  const handleRoute = () => {
    const role = localStorage.getItem("role");
    navigate(role === "student" ? "/dashboard/students" : "/dashboard/prof");
  };

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card border-0 shadow-lg p-4 text-center"
        style={{
          width: "450px",
          borderRadius: "20px",
          background: "linear-gradient(145deg, #ffffff, #f1f1f1)",
        }}
      >
        {/* Avatar */}
        <div className="text-center mb-4">
          {user.profilePic?.data ? (
            <img
              src={`data:${user.profilePic.contentType};base64,${btoa(
                new Uint8Array(user.profilePic.data.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              )}`}
              alt="profile avatar"
              width="100"
              height="100"
              className="rounded-circle border border-2 border-secondary-subtle shadow-sm"
            />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              alt="default avatar"
              width="100"
              height="100"
              className="rounded-circle border border-2 border-secondary-subtle shadow-sm"
            />
          )}
          <h3 className="fw-bold mt-3 mb-1">{user.name}</h3>
          <p className="text-muted small mb-0 text-capitalize">
            {user.role} at {user.institution || "Institution not added"}
          </p>
        </div>

        {/* Profile Info */}
        <ul className="list-group list-group-flush text-start">
          <li className="list-group-item border-0 d-flex justify-content-between">
            <strong>Roll No:</strong>
            <span>{user.rollNumber || "—"}</span>
          </li>
          <li className="list-group-item border-0 d-flex justify-content-between">
            <strong>Course:</strong>
            <span>{user.course || "—"}</span>
          </li>
          <li className="list-group-item border-0 d-flex justify-content-between">
            <strong>Semester:</strong>
            <span>{user.semester || "—"}</span>
          </li>
          <li className="list-group-item border-0 d-flex justify-content-between">
            <strong>Phone:</strong>
            <span>{user.phone || "—"}</span>
          </li>
          <li className="list-group-item border-0 d-flex justify-content-between">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </li>
        </ul>

        {/* Back Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary w-100 fw-semibold py-2"
            style={{ borderRadius: "10px" }}
            onClick={handleRoute}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
