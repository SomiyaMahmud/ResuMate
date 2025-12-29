import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import ATS from './pages/ATS'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Discussions from './pages/Discussions'
import DiscussionDetails from './pages/DiscussionDetails'
import SavedJobs from './pages/SavedJobs'
import SavedDiscussions from './pages/SavedDiscussions'
import CreateJob from './pages/CreateJob'
import MyResumes from './pages/MyResumes'
import Planner from './pages/Planner'
import Chat from './pages/Chat'
import MyFriends from './pages/MyFriends'
import ResumeReviews from './pages/ResumeReviews'
import SubmitResumeReview from './pages/SubmitResumeReview'
import ResumeReviewDetails from './pages/ResumeReviewDetails'
import CoverLetterBuilder from './pages/CoverLetterBuilder'
import Resources from './pages/Resources'
import ResourceDetails from './pages/ResourceDetails'


import { useDispatch, useSelector } from 'react-redux'
import api from './configs/api.js'
import { login, setLoading } from './app/features/authSlice'
import { setTheme } from './app/features/themeSlice'
import { Toaster } from 'react-hot-toast'








const App = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector(state => state.theme)

  const getUserData = async () => {
    const token = localStorage.getItem('token')
    try {
      if (token) {
        const { data } = await api.get('/api/users/data', { headers: { Authorization: token } })
        if (data.user) {
          dispatch(login({ token, user: data.user }))
        }
        dispatch(setLoading(false))
      } else {
        dispatch(setLoading(false))
      }
    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message);
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    dispatch(setTheme(savedTheme))
    getUserData()
  }, [])

  return (
    <>
      <Toaster
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white',
          style: {
            background: mode === 'dark' ? '#1e293b' : '#fff',
            color: mode === 'dark' ? '#fff' : '#000',
          }
        }}
      />
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='app' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='my-resumes' element={<MyResumes />} />
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
          <Route path='ats-analyzer' element={<ATS />} />
          <Route path='planner' element={<Planner />} />

          {/* Jobs */}
          <Route path='jobs' element={<Jobs />} />
          <Route path='jobs/create' element={<CreateJob />} />
          <Route path='jobs/saved' element={<SavedJobs />} />
          <Route path='jobs/:jobId' element={<JobDetails />} />

          {/* Discussions */}
          <Route path='discussions' element={<Discussions />} />
          <Route path='discussions/saved' element={<SavedDiscussions />} />
          <Route path='discussions/:discussionId' element={<DiscussionDetails />} />

          {/* Network & Chat */}
          <Route path='network' element={<MyFriends />} />
          <Route path='chat' element={<Chat />} />
          <Route path='chat/:otherUserId' element={<Chat />} />

          {/* Resume Reviews */}
          <Route path='resume-reviews' element={<ResumeReviews />} />
          <Route path='resume-reviews/submit' element={<SubmitResumeReview />} />
          <Route path='resume-reviews/:id' element={<ResumeReviewDetails />} />
          {/* Cover Letters */}
          {/* Cover Letters */}
          <Route path='cover-letter/builder/:clId' element={<CoverLetterBuilder />} />

          {/* Resources */}
          <Route path='resources' element={<Resources />} />
          <Route path='resources/:id' element={<ResourceDetails />} />
        </Route>


        <Route path='view/:resumeId' element={<Preview />} />
        {/* <Route path='login' element={<Login />} /> */}
      </Routes>
    </>
  )
}

export default App