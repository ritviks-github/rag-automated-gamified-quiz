import React from 'react'
import { Link } from 'react-router-dom'

export default function Main() {
  return (
    <div style={{height:'80vh',display:'flex',flexDirection:'column',justifyContent:'center',marginTop:'90px'}}>
      <div
        style={{
            display: "flex",
            flexDirection:'column',
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",  // centers text nicely
            padding: "0 20px",    // prevents text from touching edges on small screens
        }}
        >
        <h1
        style={{
            fontSize: "3rem",
            fontWeight: 600,
            color: "white",
            textShadow: "0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)"
        }}
        >
        Spend Less Time Marking, More Time Inspiring
        </h1>
        <h2 style={{
           color:'white',
           fontWeight:100
            
        }}>
            Advanced AI-powered proctoring technology that ensures exam integrity while providing a seamless experience for test-takers and administrators.
        </h2>
    </div>
    <div
        style={{
            display: "flex",
            gap: "15px",           // clean spacing between buttons
            justifyContent: "center",
            marginTop: "20px",     // some breathing room from content above
        }}
        >
        <Link to='/signup' className="btn btn-light btn-lg">Get Started</Link>
        <button className="btn btn-outline-light btn-lg">Watch Demo</button>
    </div>
    </div>
  )
}
