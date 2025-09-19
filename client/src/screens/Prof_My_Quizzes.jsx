import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Prof_My_Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openQuiz, setOpenQuiz] = useState(null);


  const navigate = useNavigate();
  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role == 'student'){
      alert("Unauthorized Access");
      navigate("/dashboard/students");
    }
  },[]);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const professorId = localStorage.getItem("userId");
        const res = await axios.get("http://localhost:8080/api/get-all-quizzes", {
            params: { professorId },
        });
        setQuizzes(res.data);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center mb-4 text-white">My Quizzes</h2>

      {quizzes.length === 0 ? (
        <p className="text-center text-muted">No quizzes created yet.</p>
      ) : (
        quizzes.map((quiz, idx) => (
          <div key={quiz._id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title mb-1">Quiz #{idx + 1}</h5>
                  <h6 className="card-subtitle text-muted mb-2">
                    Room ID: {quiz.roomId}
                  </h6>
                  <small className="text-muted">
                    Created: {new Date(quiz.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="d-flex flex-column gap-2">
                    <button
                        className="btn btn-info fw-semibold rounded-pill shadow-sm text-white"
                        onClick={() =>
                        setOpenQuiz(openQuiz === quiz._id ? null : quiz._id)
                        }
                    >
                        {openQuiz === quiz._id ? "Hide Questions" : "View Questions"}
                    </button>

                    <button
                        className="btn btn-outline-info fw-semibold rounded-pill shadow-sm"
                    >
                        View Report of Participants
                    </button>
                </div>
              </div>

              {openQuiz === quiz._id && (
                <div className="mt-3">
                  {quiz.questions.map((q, i) => (
                    <div key={q._id || i} className="card mb-2 border">
                      <div className="card-body p-2">
                        <p className="mb-1">
                          <strong>Q{i + 1}:</strong> {q.text}
                        </p>
                        <p className="mb-1">
                          <strong>Type:</strong> {q.type}
                        </p>
                        <p className="mb-1">
                          <strong>Score:</strong> {q.score}
                        </p>
                        <p className="mb-1">
                          <strong>Time Limit:</strong> {q.timeLimit} sec
                        </p>
                        {q.options && q.options.length > 0 && (
                          <p className="mb-0">
                            <strong>Options:</strong> {q.options.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
