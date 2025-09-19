import React, { useEffect } from 'react'
import UploadFile from '../components/UploadFile'
import { useNavigate } from 'react-router-dom'

export default function Prof_Upload() {
  const navigate = useNavigate();
  useEffect(()=>{
    const role = localStorage.getItem("role");
    if(role == 'student'){
      alert("Unauthorized Access");
      navigate('/dashboard/students');
    }
  },[]);
  return (
    <div>
      <UploadFile />
    </div>
  )
}
