import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  DndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';


function DraggableOption({ id, option }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    padding: '8px 12px',
    margin: '5px',
    background: '#444',
    borderRadius: '6px',
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {option}
    </div>
  );
}

function DropZone({ selected, currentQuestion, removeOption }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'answer-zone' });
  const style = {
    minHeight: '60px',
    border: '2px dashed #666',
    borderRadius: '8px',
    padding: '8px',
    background: isOver ? '#222' : '#111',
    textAlign: 'center',
    color: '#ccc',
    marginBottom: '12px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {selected.length ? (
        selected.map(idx => (
          <span
            key={idx}
            onClick={() => removeOption(idx)}
            style={{
              marginRight: '8px',
              padding: '4px 8px',
              background: '#555',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {currentQuestion.options[idx]} ✕
          </span>
        ))
      ) : (
        'Drop your answers here'
      )}
    </div>
  );
}



export default function Quiz_Studs() {
  const { roomId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};
  const studentId = localStorage.getItem("userId");
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5, // Start dragging after moving 5px
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150, // 150ms press delay before drag
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  const removeOption = (optionIndex) => {
    setSelectedOptions(prev => prev.filter(idx => idx !== optionIndex));
  };

  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role != 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/prof');
    }
    const checkAttempted = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/check-attempted-quiz", {
        params: {
          studentId: localStorage.getItem("userId"),
          testId: roomId,
        },
      });

      if (response.data.attempted) {
        alert("You have already submitted this quiz.");
        navigate("/result");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to check quiz attempt");
    }
  };

  checkAttempted();
  },[navigate,roomId]);

  const storageKey = `quiz-progress-${roomId}-${studentId}`;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    quiz ? quiz.questions[0].timeLimit : 0
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [allResponses, setAllResponses] = useState([]);

  // Restore progress on mount
  useEffect(() => {
    if (!quiz) {
      navigate("/dashboard/students");
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentQuestionIndex(parsed.currentQuestionIndex);
      setTimeLeft(parsed.timeLeft);
      setSelectedOptions(parsed.selectedOptions);
      setCompletedQuestions(parsed.completedQuestions || []);
      setAllResponses(parsed.allResponses || []);
    } else {
      // Start fresh
      setCurrentQuestionIndex(0);
      setTimeLeft(quiz.questions[0].timeLimit);
      setSelectedOptions([]);
      setCompletedQuestions([]);
      setAllResponses([]);
    }
  }, [quiz, navigate, storageKey]);

  // Persist progress
  useEffect(() => {
    if (quiz) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentQuestionIndex,
          timeLeft,
          selectedOptions,
          completedQuestions,
          allResponses,
        })
      );
    }
  }, [quiz, currentQuestionIndex, timeLeft, selectedOptions, completedQuestions, allResponses, storageKey]);
  const [powerUps, setPowerUps] = useState({
    addTime20: 1,       // 1 use
    freezeTime: 1,      // 1 use
    doubleScore: 1,     // 1 use
  });
  const [timerFrozen, setTimerFrozen] = useState(false);
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);
  // Timer
  useEffect(() => {
    if (timerFrozen) return;


    if (timeLeft <= 0) {
      if (!completedQuestions.includes(currentQuestionIndex)) {
        handleNextQuestion();
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestionIndex, completedQuestions,timerFrozen]);

  const handlePowerUpUse = (type) => {
  if (powerUps[type] <= 0) return; // no uses left

  switch (type) {
    case "addTime20":
      setTimeLeft(prev => prev + 20);
      break;
    case "freezeTime":
      setTimerFrozen(true);
      // auto-unfreeze after 10 seconds
      setTimeout(() => setTimerFrozen(false), 10000);
      break;
    case "doubleScore":
      setDoubleScoreActive(true);
      break;
    default:
      break;
  }

  setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
};

  const handleOptionSelect = (optionIndex) => {
    if (quiz.questions[currentQuestionIndex].type === "mcq") {
      setSelectedOptions(prev =>
        prev.includes(optionIndex)
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    }
  };

  const handleNextQuestion = async () => {
    // Save current response
    const currentQuestionData = quiz.questions[currentQuestionIndex];
  const baseAnswer = currentQuestionData.type === "mcq" ? selectedOptions : selectedOptions[0] || "";

  const currentResponse = {
    questionId: currentQuestionData._id,
    answer: baseAnswer,
    doubleScore: doubleScoreActive ? true : false, // pass flag for backend scoring
  };

  if (doubleScoreActive) {
    setDoubleScoreActive(false); // reset after use
  }

    setAllResponses(prev => [
      ...prev.filter(r => r.questionId !== currentResponse.questionId),
      currentResponse,
    ]);

    setCompletedQuestions(prev => {
      const updated = [...prev];
      if (!updated.includes(currentQuestionIndex)) updated.push(currentQuestionIndex);
      return updated;
    });

    // Next question or submit
    if (currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(quiz.questions[nextIndex].timeLimit);
      setSelectedOptions([]);
    } else {
      // Submit
      try {
        await axios.post("http://localhost:8080/api/submit-quiz", {
          studentId,
          testId: roomId,
          responses: [...allResponses, currentResponse],
        });
        alert("Quiz submitted successfully!");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to submit quiz.");
      } finally {
        localStorage.removeItem(storageKey);
        navigate("/result", { state: { quiz } });
      }
    }
  };

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          padding: "20px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 0 15px rgba(255,255,255,0.1)",
        }}
      >
        <h2 className="text-center mb-3">
          Question {currentQuestionIndex + 1}
        </h2>
        <p className="fs-5 fw-semibold mb-4">{currentQuestion.text}</p>

        {currentQuestion.type === "mcq" && (
  <DndContext
    sensors={sensors}
    onDragEnd={(event) => {
      const { over, active } = event;
      if (over && over.id === 'answer-zone') {
        const optionIndex = Number(active.id.replace('option-', ''));
        setSelectedOptions(prev => 
          prev.includes(optionIndex) ? prev : [...prev, optionIndex]
        );
      }

    }}
  >
    <DropZone
  selected={selectedOptions}
  currentQuestion={currentQuestion}
  removeOption={removeOption}
/>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {currentQuestion.options.map((opt, idx) => (
        <DraggableOption key={idx} id={`option-${idx}`} option={opt} />
      ))}
    </div>
  </DndContext>
)}


        {currentQuestion.type === "subjective" && (
          <textarea
            rows="4"
            className="form-control bg-dark text-white border-0 shadow-sm rounded-3 mb-3"
            placeholder="Type your answer here..."
            value={selectedOptions[0] || ""}
            disabled={
              completedQuestions.includes(currentQuestionIndex) || timeLeft === 0
            }
            onChange={(e) => setSelectedOptions([e.target.value])}
          ></textarea>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">Time Left: {timeLeft}s</span>
          <button
            onClick={handleNextQuestion}
            disabled={completedQuestions.includes(currentQuestionIndex)}
            className="btn btn-light fw-semibold rounded-pill shadow-sm"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      </div>
      {/* Bottom-fixed Power-Up Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#222",
          padding: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      >
        <button
          className="btn btn-sm btn-warning fw-bold"
          disabled={powerUps.addTime20 <= 0}
          onClick={() => handlePowerUpUse("addTime20")}
        >
          +20s ({powerUps.addTime20})
        </button>
        <button
          className="btn btn-sm btn-info fw-bold"
          disabled={powerUps.freezeTime <= 0}
          onClick={() => handlePowerUpUse("freezeTime")}
        >
          Freeze (10s) ({powerUps.freezeTime})
        </button>
        <button
          className="btn btn-sm btn-success fw-bold"
          disabled={powerUps.doubleScore <= 0}
          onClick={() => handlePowerUpUse("doubleScore")}
        >
          2× Score ({powerUps.doubleScore})
        </button>
      </div>

    </div>
  );
}
