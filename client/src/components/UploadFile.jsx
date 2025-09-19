import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function UploadFile() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false); // ✅ track uploading state
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload!");
      return;
    }

    setUploading(true); // ✅ start uploading state
    const quizId = uuidv4();
    localStorage.setItem("quiz_ID", quizId);
    const professorId = localStorage.getItem("userId");

    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("professor_id", professorId);
        formData.append("quiz_id", quizId);

        const response = await fetch("http://127.0.0.1:8000/upload-pdf", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Chunks response:", data);
        alert(`Uploaded ${file.name}, created ${data.chunks.length} chunks`);

        localStorage.setItem(`chunks_${file.name}`, JSON.stringify(data.chunks));
      }

      // Navigate after all uploads
      navigate("/dashboard/prof/questions");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false); // ✅ reset uploading state
    }
  };

  return (
    <div
      id="upload-section"
      className="d-flex justify-content-center align-items-center vh-100 bg-black"
    >
      <div
        className="card shadow-lg p-4 text-center"
        style={{ width: "500px", borderRadius: "20px" }}
      >
        <h2 className="mb-4 fw-bold">Upload Lecture Material</h2>

        <input
          type="file"
          multiple
          className="form-control mb-3"
          onChange={handleFileChange}
        />

        {files.length > 0 && (
          <ul className="list-group mb-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{file.name}</span>
                <button
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => removeFile(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          className="btn btn-dark w-100"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? "Uploading..." : "Upload Files"} {/* ✅ dynamic text */}
        </button>
      </div>
    </div>
  );
}
