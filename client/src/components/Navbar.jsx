import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import "../App.css"

export default function Navbar() {
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("main-navbar")
      if (window.scrollY > 50) {
        nav.classList.add("scrolled")
      } else {
        nav.classList.remove("scrolled")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      id="main-navbar"
      className="navbar navbar-expand-lg navbar-light bg-white rounded-pill shadow-sm fixed-top py-2 px-4 mx-auto mt-3"
      style={{ width: "90%", maxWidth: "1100px" }} // keep it floating, centered
    >
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-uppercase text-black">
          Proctor Secure
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link text-black px-3" href="#features">
                Features
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-black px-3" href="#contact">
                Contact
              </a>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link text-black px-3 fw-semibold border rounded-pill border-dark"
                to="/signup"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
