import React from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const navigate = useNavigate();
  const handleRoute = ()=>{
    if(role == 'student'){
        navigate('/dashboard/students');
    }else{
        navigate('/dashboard/prof');
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div
        className="card shadow-lg p-4"
        style={{ width: "400px", borderRadius: "20px" }}
      >
        <h2 className="text-center mb-4 fw-bold">Profile</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item d-flex justify-content-between">
            <strong>User ID:</strong>
            <span>{userId}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <strong>Role:</strong>
            <span className="text-capitalize">{role}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <strong>Email:</strong>
            <span>{email}</span>
          </li>
        </ul>

        <div className="text-center mt-4">
          <button
            className="btn btn-dark w-100"
            onClick={handleRoute}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
