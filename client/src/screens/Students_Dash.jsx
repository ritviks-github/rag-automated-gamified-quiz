import React, { useEffect, useState } from 'react';
import Bar from '../components/Bar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export default function Students_Dash() {
  const [roomId, setRoomId] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role != 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/prof');
    }
    const student_id = localStorage.getItem("userId");
    if(!student_id){
      navigate('/login');
    }
  },[]);

  const handleQuizJoin = async () => {
    if (!roomId.trim()) {
      alert('Please enter a valid Room ID');
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch quiz from backend
      const res = await fetch(`http://localhost:8080/api/get-quiz/${roomId}`);
      if (!res.ok) {
        throw new Error('Quiz not found');
      }
      const data = await res.json();

      const resultRes = await axios.get(`http://localhost:8080/api/check-attempted-quiz`, {
        params: {
          studentId: localStorage.getItem("userId"),
          testId: roomId,
        },
      });

      if (resultRes.data.attempted) {
        alert("You have already submitted this quiz.");
        setLoading(false);
        return;
      }


      // 2. Start countdown
      let timeLeft = 10;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);

          // 3. Navigate to quiz page, pass quiz data
          navigate(`/quiz/${roomId}`, { state: { quiz: data } });
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to join quiz');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'black' }}>
      <Bar />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 60px)', // adjust for Bar height
        }}
      >
        <h1 className="text-center text-white mb-3">Join Quiz</h1>
        <p className="text-center text-white mb-4">
          Enter the Room ID shared by your professor to join the quiz session.
        </p>

        <div className="mb-3 w-100" style={{ maxWidth: '400px' }}>
          <label htmlFor="roomId" className="form-label fw-semibold text-white">
            Room ID
          </label>
          <input
            id="roomId"
            type="text"
            className="form-control bg-dark text-white border-0 shadow-sm rounded-3 px-3 py-2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            disabled={loading} // lock input while joining
          />
        </div>

        <button
          onClick={handleQuizJoin}
          disabled={loading}
          className="btn btn-light px-4 py-2 fw-semibold rounded-pill shadow-sm"
        >
          {countdown !== null ? `Joining in ${countdown}...` : 'Join'}
        </button>
      </div>
    </div>
  );
}
