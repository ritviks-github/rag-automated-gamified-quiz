import React from 'react'
import Card from './Card'
import Contributors from './Contributors'

export default function Features() {
  return (
    <div id = 'features' style={{
            display: "flex",
            flexDirection:'column',
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",  // centers text nicely
            padding: "0 20px",    // prevents text from touching edges on small screens

        }}>
        <h1 style={{
            fontSize: "3rem",
            fontWeight: 600,
            color: "white",
            textShadow: "0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)"
        }}>
            Enterprise-Grade Security Features
        </h1>
        <h2 style={{
           color:'white',
           fontWeight:100
            
        }}>
            Comprehensive proctoring solutions designed for educational institutions and corporate hiring teams.
        </h2>
        <section className="container my-5">
      <div className="row justify-content-center g-4">
        <div className="col-md-6 col-lg-4">
          <Card
            title="Grounded Context Window"
            description="Ground the context window by uploading the desired lecture material."
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <Card
            title="Automated Test Checking"
            description="Reduce your workload by letting AI handle class test evaluations."
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <Card
            title="Instant Insights"
            description="Get quick analytics and feedback on student performance."
          />
        </div>
      </div>
    </section>
    
    <Contributors />
    </div>
  )
}
