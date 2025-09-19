import React from "react";
import { Link,useNavigate } from "react-router-dom";
import "../App.css";

export default function Bar() {
    const navigate = useNavigate();
  return (
    <nav
      id="main-navbar"
      className="navbar navbar-expand-lg navbar-light bg-white rounded-pill shadow-sm py-2 px-4 mx-auto my-3"
      style={{ width: "90%", maxWidth: "1100px" }} // floating, centered
    >
      <div className="container-fluid">
        {/* Brand */}
        <Link to="/" className="navbar-brand fw-bold text-uppercase text-black">
          Secure CT
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            {/* User ID (link to profile) */}
            <li className="nav-item">
              <Link
                to="/profile"
                className="nav-link text-black px-3 fw-semibold"
              >
               User ID : {localStorage.getItem("userId")}
              </Link>
            </li>

            {/* Logout */}
            <li className="nav-item">
              <button
                className="btn btn-dark rounded-pill px-3 ms-2"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
