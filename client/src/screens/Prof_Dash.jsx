import React, { useEffect } from 'react'
import Bar from '../components/Bar'
import {Link, useNavigate} from 'react-router-dom'

export default function Prof_Dash() {
  const navigate = useNavigate();
  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role == 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/students');
    }
    const prof_id = localStorage.getItem("userId");
    if(!prof_id){
      navigate('/login');
    }
  },[]);
  return (
    <div>
      <Bar />
      {/* Intro Section */}
<div className="container text-center text-white py-5">
  <h1 className="display-4 fw-bold mb-3">Professor Dashboard</h1>
  
  <p className="lead mx-auto mb-4" style={{ maxWidth: "700px" }}>
    Welcome to <span className="fw-bold text-info">Secure CT</span>.  
    Here, you can securely upload lecture materials for your students.  
    You may upload a single file or multiple files at once.  
    The system will process these files and extract meaningful context 
    for further use in assessments and secure teaching.
  </p>

  {/* Buttons */}
  <div className="d-flex justify-content-center gap-3 mt-4">
    <Link 
      to="/dashboard/prof/upload" 
      className="btn btn-light px-4 py-2 fw-semibold rounded-pill shadow-sm"
    >
      Start Now
    </Link>
    <Link 
      to="/dashboard/prof/my-quizzes" 
      className="btn btn-info px-4 py-2 fw-semibold rounded-pill shadow-sm text-white"
    >
      My Quizzes
    </Link>
  </div>
</div>

      
    </div>
  )
}
