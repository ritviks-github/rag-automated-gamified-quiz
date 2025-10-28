import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ReviewAnswers() {
  const { roomId } = useParams(); // testId
  
  const location = useLocation();
  const navigate = useNavigate();

  const quiz = location.state?.quiz;
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("userId");
  const handleLeaderboardClick = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/check-normalization", {
      params: { testId: roomId },
    });

    if (res.data.normalized) {
      navigate(`/result/${roomId}`, { state: { quiz } });
    } else {
      alert("Results are still being processed. Please wait a few seconds...");
    }
  } catch (err) {
    console.error("Error checking normalization status:", err);
    alert("Unable to check leaderboard status right now.");
  }
};

  

  useEffect(() => {
    const role = localStorage.getItem("role");
    if(role != 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/prof');
    }

    const fetchResponses = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/get-student-responses", {
          params: { testId: roomId, studentId },
        });
        setResponses(res.data.responses?.length ? res.data.responses : res.data.evaluations || []);

      } catch (error) {
        console.error("Error fetching student responses:", error);
        navigate("/dashboard/students");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [roomId, quiz, navigate, studentId]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading responses...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "white",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#111",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 0 10px rgba(255,255,255,0.1)",
        }}
      >
        <h2 className="text-center mb-4">Your Responses</h2>

        <button
          className="btn btn-outline-light mb-4 w-100"
          onClick={handleLeaderboardClick}
        >
          See Leaderboard →
        </button>

        {quiz.questions.map((q, index) => {
          const response = responses.find((r) => r.questionId === q._id);
          return (
            <div
              key={q._id}
              style={{
                backgroundColor: "#222",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h5 style={{ color: "#ddd" }}>
                Q{index + 1}. {q.text}
              </h5>

              {q.type === "mcq" ? (
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "6px 8px",
                        marginTop: "5px",
                        borderRadius: "4px",
                        backgroundColor: response?.answer?.includes(i)
                          ? "#28a745"
                          : "#333",
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  style={{
                    backgroundColor: "#333",
                    padding: "10px",
                    borderRadius: "6px",
                    color: "#ccc",
                  }}
                >
                  {response?.answer || "No answer provided"}
                </p>
              )}

              {response?.feedback && (
                <p
                  style={{
                    marginTop: "10px",
                    fontStyle: "italic",
                    color: "#aaa",
                    backgroundColor: "#1a1a1a",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  💬 Feedback: {response.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
