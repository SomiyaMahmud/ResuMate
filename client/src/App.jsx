import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/preview'
import Login from './pages/Login'
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
  
  // ← UPDATED useEffect
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
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
        </Route>
        
        <Route path='view/:resumeId' element={<Preview />} />
        {/* <Route path='login' element={<Login />} /> */}
      </Routes>
    </>
  )
}

export default App