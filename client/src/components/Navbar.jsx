import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
// REMOVE THIS LINE: import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const {user} = useSelector(state=> state.auth)
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const logoutUser = ()=>{
    navigate('/')
    dispatch(logout())
  }
  
  return (
    <div className='shadow bg-white dark:bg-slate-900 transition-colors duration-300'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 dark:text-slate-200 transition-colors'>
        <Link>
          <img src="/logo.svg" alt="" className='h-11 w-auto'/>
        </Link>
        <div className='flex items-center gap-4 text-sm'>
          {/* REMOVE THIS LINE: <ThemeToggle /> */}
          
          <p className='max-sm:hidden'>Hi, {user?.name}</p>
          <button 
            onClick={logoutUser} 
            className='bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 px-7 py-1.5 rounded-full active:scale-95 transition-all'
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar