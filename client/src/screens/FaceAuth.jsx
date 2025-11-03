import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";


export default function FaceAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quiz, roomId } = location.state || {};
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  // 🔹 Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Camera access denied. Please allow access to continue.");
    }
  };

  // 🔹 Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // 🔹 Mount & unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 🔹 Capture photo
  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);
    stopCamera();
  };

  // 🔹 Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // 🔹 Verify face
  const handleVerify = async () => {
    if (!capturedImage) return setError("Please capture an image first.");
    setLoading(true);
    setError("");

    try {
      const blob = await fetch(capturedImage).then((res) => res.blob());
      const formData = new FormData();

      const sourceImageResponse = await fetch(
        `http://localhost:8080/api/user_image/${userId}`
      );
      console.log("🧩 Source Image Response:", sourceImageResponse.status, sourceImageResponse.headers.get("content-type"));
      const sourceBlob = await sourceImageResponse.blob();

      formData.append("source_image", sourceBlob, "source.jpg");
      formData.append("image_to_be_verified", blob, "verify.jpg");

      const res = await axios.post(
        "http://localhost:8000/face_recognition",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.verified) {
        navigate(`/waiting-room/${roomId}`, { state: { quiz } });
        localStorage.setItem("faceAuthVerified", "true");

      } else {
        setError("❌ Face not recognized. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background:
          "linear-gradient(135deg, rgba(30,87,153,1) 0%, rgba(41,137,216,1) 50%, rgba(125,185,232,1) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="shadow-lg text-center p-4"
        style={{
          width: "420px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
          color: "white",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="fw-bold mb-3">Face Authentication</h3>
        <p className="small mb-4 text-light">
          Allow camera access and capture your face for verification.
        </p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Camera or Captured Image */}
        <div
          className="d-flex align-items-center justify-content-center mb-3"
          style={{
            width: "250px",
            height: "250px",
            margin: "0 auto",
            borderRadius: "50%",
            overflow: "hidden",
            border: "5px solid rgba(255,255,255,0.4)",
            boxShadow: "0 0 15px rgba(255,255,255,0.3)",
            backgroundColor: "#000",
          }}
        >
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-3">
          {!capturedImage ? (
            <button
              className="btn btn-light text-primary fw-semibold px-4"
              onClick={handleCapture}
            >
              📸 Capture
            </button>
          ) : (
            <>
              <button
                className="btn btn-outline-light px-3"
                onClick={handleRetake}
              >
                🔄 Retake
              </button>
              <button
                className="btn btn-success px-3 fw-semibold"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "✅ Verify"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
