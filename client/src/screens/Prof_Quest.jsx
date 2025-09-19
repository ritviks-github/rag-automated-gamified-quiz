import React, { useState } from "react";
import { useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Prof_Quest() {
  const [questions, setQuestions] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role == 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/students');
    }
  },[]);

  const isQuizValid = () => {
  for (let q of questions) {
    if (
      !q.text.trim() || 
      !q.score || 
      !q.timeLimit || 
      !q.type
    ) {
      return false; // required fields empty
    }

    if (q.type === "mcq") {
      // All options should be non-empty
      if (q.options.some(opt => !opt.trim())) return false;

      // At least one correct answer
      if (q.correctAnswers.length === 0) return false;
    }
  }
  return true;
};


  // Create a new question template
  const createQuestion = (id) => ({
    id,
    text: "",
    score: "",
    type: "mcq",
    options: [""],
    correctAnswers: [], // store multiple correct options as array of indices
    timeLimit:'', 
  });

  // Add initial questions
  const handleSetQuestions = (num) => {
    const newQuestions = Array.from({ length: num }, (_, i) =>
      createQuestion(i + 1)
    );
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter(
      (_, i) => i !== optIndex
    );

    // Remove optIndex if it was marked correct
    updated[qIndex].correctAnswers = updated[qIndex].correctAnswers.filter(
      (ans) => ans !== optIndex
    );

    // Re-map correctAnswers to new option indices
    updated[qIndex].correctAnswers = updated[qIndex].correctAnswers.map((ans) =>
      ans > optIndex ? ans - 1 : ans
    );

    setQuestions(updated);
  };

  // Toggle multiple correct answers
  const toggleCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...questions];
    const correctSet = new Set(updated[qIndex].correctAnswers);

    if (correctSet.has(optIndex)) {
      correctSet.delete(optIndex);
    } else {
      correctSet.add(optIndex);
    }

    updated[qIndex].correctAnswers = Array.from(correctSet);
    setQuestions(updated);
  };

  // Add a new question dynamically
  const addQuestion = () => {
    setQuestions([...questions, createQuestion(questions.length + 1)]);
  };

  // Remove a question dynamically
  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.map((q, i) => ({ ...q, id: i + 1 }))); // reindex IDs
  };


  const [roomId,setRoomId] = useState('');
  const [profId,setProfID] = useState('');
  useEffect(()=>{
    const uid = localStorage.getItem("quiz_ID");
    const pid = localStorage.getItem("userId");
    setRoomId(uid);
    setProfID(pid);
    const fetchQuiz = async () => {
        try {
        const res = await axios.get(`http://localhost:8080/api/get_quiz/${uid}`);
        if (res.status === 200 && res.data.questions) {
            setQuestions(res.data.questions);
            setIsSaved(true); // mark as already saved
        }
        } catch (err) {
        console.error("Error fetching quiz:", err);
        }
    };

    if (uid) fetchQuiz();


  },[]);

  const handleSave = async () => {
  try {
    const payload = {
      roomId,
      professorId: profId,
      questions,
    };

    console.log("Sending Quiz:", payload);

    const res = await axios.post("http://localhost:8080/api/create_quiz", payload);

    if (res.status === 201) {
      alert("✅ Quiz saved successfully!");
      console.log(res.data);
      setIsSaved(true); // mark as saved
    }
  } catch (err) {
    console.error("Error saving quiz:", err);
    alert("❌ Failed to save quiz, check console for details.");
  }
};

const handleUpdate = async () => {
  try {
    const payload = { questions };

    const res = await axios.put(
      `http://localhost:8080/api/update_quiz/${roomId}`,
      payload
    );

    if (res.status === 200) {
      alert("✅ Quiz updated successfully!");
      console.log(res.data);
    }
  } catch (err) {
    console.error("Error updating quiz:", err);
    alert("❌ Failed to update quiz, check console for details.");
  }
};
  return (
    <div className="container py-5 text-white">
      <h2 className="text-center mb-4">Quiz_Room Number : {roomId}</h2>

      {/* Set initial questions count */}
      {questions.length === 0 && (
        <div className="d-flex justify-content-center mb-4">
          <input
            type="number"
            min="1"
            className="form-control w-25 me-2"
            placeholder="Enter number of questions"
            onChange={(e) => handleSetQuestions(Number(e.target.value))}
          />
          <button
            className="btn btn-light"
            onClick={() => handleSetQuestions(1)}
          >
            Start with 1
          </button>
        </div>
      )}

      {/* Questions Form */}
      {questions.map((q, index) => (
        <div
          key={q.id}
          className="card shadow-sm mb-4 p-3 bg-dark text-white"
          style={{ borderRadius: "15px" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5>Question {index + 1}</h5>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeQuestion(index)}
            >
              Remove Question
            </button>
          </div>

          {/* Question Text */}
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Enter the question text here"
            value={q.text}
            onChange={(e) =>
              handleQuestionChange(index, "text", e.target.value)
            }
          />

          {/* Score */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Enter score for this question"
            min="1"
            value={q.score}
            onChange={(e) =>
              handleQuestionChange(index, "score", e.target.value)
            }
          />

          {/* Time Limit */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Enter time limit (in seconds)"
            min="5"
            value={q.timeLimit}
            onChange={(e) =>
              handleQuestionChange(index, "timeLimit", Number(e.target.value))
            }
          />

          {/* Type Selector */}
          <select
            className="form-select mb-3"
            value={q.type}
            onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
          >
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="subjective">Subjective</option>
          </select>

          {/* Options if MCQ */}
          {q.type === "mcq" && (
            <div>
              <h6>
                Options (You can select <b>multiple correct answers</b>)
              </h6>
              {q.options.map((opt, i) => (
                <div key={i} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(index, i, e.target.value)
                    }
                  />

                  <div className="form-check me-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={q.correctAnswers.includes(i)}
                      onChange={() => toggleCorrectAnswer(index, i)}
                    />
                    <label className="form-check-label">
                      Mark as Correct
                    </label>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-light ms-2"
                    onClick={() => removeOption(index, i)}
                  >
                    ✖
                  </button>
                </div>
              ))}
              <button
                className="btn btn-sm btn-light"
                onClick={() => addOption(index)}
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Buttons */}
      {questions.length > 0 && (
  <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
    {/* Add Question Button */}
    <button
      className="btn btn-outline-light"
      onClick={addQuestion}
    >
      + Add Question
    </button>

    {/* Save / Update Button */}
    <button
      className={`btn ${isSaved ? "btn-dark" : "btn-dark"}`}
      onClick={isSaved ? handleUpdate : handleSave}
      disabled={!isQuizValid()}
    >
      {isSaved ? "Update Quiz" : "Save Quiz"}
    </button>

    {/* Continue Button */}
    <button
      className="btn btn-outline-light"
      disabled={!isSaved} // only enable if quiz is saved
      onClick={() => navigate("/dashboard/prof/my-quizzes")}
    >
      Continue
    </button>
  </div>
)}

    </div>
  );
}
