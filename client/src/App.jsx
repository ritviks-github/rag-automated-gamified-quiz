import './App.css'
import Home from './screens/Home'
import {Routes,Route} from 'react-router-dom'
import Signup from './screens/Signup'
import Login from './screens/Login'
import Students_Dash from './screens/Students_Dash'
import Prof_Dash from './screens/Prof_Dash'
import Profile from './screens/Profile'
import Prof_Quest from './screens/Prof_Quest'
import Prof_Upload from './screens/Prof_Upload'
import Prof_My_Quizzes from './screens/Prof_My_Quizzes'
import Quiz_Studs from './screens/Quiz_Studs'
import Result from './screens/Result'
import WaitingRoom from './screens/WaitingRoom'
import ReviewAnswers from './screens/ReviewAnswers'

function App() {
 

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path= '/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard/students' element={<Students_Dash />} />
        <Route path='/dashboard/prof' element={<Prof_Dash />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/dashboard/prof/questions' element={<Prof_Quest />} />
        <Route path='/dashboard/prof/upload' element={<Prof_Upload />} />
        <Route path='/dashboard/prof/my-quizzes' element={<Prof_My_Quizzes />} />
        <Route path="/quiz/:roomId" element={<Quiz_Studs />} />
        <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
        <Route path='/result/:testId' element={<Result />} />
        <Route path='/review-answers/:roomId' element={<ReviewAnswers />} />
      </Routes>
    </>
  )
}

export default App
