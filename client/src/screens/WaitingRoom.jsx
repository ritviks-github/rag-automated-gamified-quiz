import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Bar from "../components/Bar";

export default function WaitingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const quiz = location.state?.quiz;
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }
    const faceAuthVerified = localStorage.getItem("faceAuthVerified");
    if (role === "student" && faceAuthVerified !== "true") {
      alert("Please complete face authentication before joining the quiz.");
      navigate(`/face-auth/${roomId}`); // Redirect to your face auth route
      return;
    }

    const joinQuiz = async () => {
      if (role === "student") {
        try {
          await axios.post(`http://localhost:8080/api/join-quiz`, {
            quizId: roomId,
            studentId: userId,
          });
        } catch (err) {
          console.error("Join quiz failed:", err);
        }
      }
    };
    joinQuiz();

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/get-room-status/${roomId}`
        );
        setParticipants(res.data.participants || []);
        setQuizStarted(res.data.quizStarted);
        setLoading(false);

        if (res.data.quizStarted && role === "student") {
          clearInterval(interval);
          navigate(`/quiz/${roomId}`, { state: { quiz } });
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, role, userId, token, navigate, quiz]);

  const handleStartQuiz = async () => {
    setStarting(true);
    try {
      await axios.post(`http://localhost:8080/api/start-quiz`, {
        quizId: roomId,
      });
      setQuizStarted(true);
      alert("Quiz started successfully!");
      if(role === "student"){
        navigate(`/quiz/${roomId}`, { state: { quiz } });
        return;
      }
    } catch (err) {
      console.error("Error starting quiz:", err);
      alert("Failed to start quiz");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100 text-white"
      style={{ backgroundColor: "black" }}
    >
      <Bar />

      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-start mt-5">
        <h2 className="fw-bold mb-3 text-center">Waiting Room</h2>
        <p className="text-secondary mb-4 text-center">Room ID: {roomId}</p>

        {loading ? (
          <p>Loading participants...</p>
        ) : (
          <>
            <h5 className="mb-3">Participants Joined:</h5>

            <div
              className="table-responsive border rounded-3 shadow"
              style={{
                backgroundColor: "#0d0d0d",
                maxHeight: "350px",
                overflowY: "auto",
                width: "90%",
                maxWidth: "600px",
              }}
            >
              <table className="table table-dark table-striped table-hover align-middle mb-0">
                <thead
                  style={{
                    backgroundColor: "#1a1a1a",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="text-white">{p.name}</td>
                        <td className="text-secondary">{p.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">
                        No participants yet...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {role === "professor" ? (
              <div
                className="text-center p-3 position-fixed bottom-0 start-0 end-0 bg-dark border-top"
                style={{ zIndex: 1050 }}
              >
                <button
                  onClick={handleStartQuiz}
                  disabled={starting || quizStarted}
                  className="btn btn-light px-5 py-2 fw-semibold rounded-pill shadow-sm"
                >
                  {starting
                    ? "Starting..."
                    : quizStarted
                    ? "Quiz Started"
                    : "Start Quiz"}
                </button>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-warning">
                  Waiting for the professor to start the quiz...
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
