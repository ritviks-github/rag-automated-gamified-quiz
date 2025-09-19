import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Main from '../components/Main'
import Features from '../components/Features'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate();
  useEffect(()=>{
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if(token){
      if(role == 'student'){
        navigate('/dashboard/students');
      }else{
        navigate('/dashboard/prof');
      }
    }
  },[]);
  return (
    <div>
      <Navbar />
      <Main />  
      <br />
      <Features />  
    </div>
  )
}
