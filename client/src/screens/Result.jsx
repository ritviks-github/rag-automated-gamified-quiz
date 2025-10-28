import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

export default function Result() {
  const { testId } = useParams();            // get testId from URL
  const location = useLocation();
  const quiz = location.state?.quiz;         // optional: quiz object from state
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!testId) return;

    axios.get(`http://localhost:8080/api/results/${testId}`)
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error(err));
  }, [testId]);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body">
          <h2 className="card-title text-center mb-4 fw-bold text-primary">
            🏆 Quiz Leaderboard
          </h2>

          {leaderboard.length === 0 ? (
            <p className="text-center text-muted mb-0">
              No results available yet for this quiz.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">User ID</th>
                    <th scope="col">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => {
                    const rank = user.rank ?? index + 1;
                    const isTop3 = rank <= 3;

                    return (
                      <tr
                        key={user.userId}
                        className={
                          isTop3
                            ? rank === 1
                              ? "table-warning"
                              : rank === 2
                              ? "table-secondary"
                              : "table-info"
                            : ""
                        }
                      >
                        <td className="fw-bold">
                          {rank === 1
                            ? "🥇"
                            : rank === 2
                            ? "🥈"
                            : rank === 3
                            ? "🥉"
                            : `#${rank}`}
                        </td>
                        <td className="text-primary fw-semibold">{user.userId}</td>
                        <td>
                          <span className="badge bg-success fs-6">
                            {user.score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
