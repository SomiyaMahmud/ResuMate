import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { 
  Briefcase, MessageSquare, FileText, Target, 
  Bookmark, User, LogOut, ChevronDown, Plus 
} from 'lucide-react'

const Navbar = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const logoutUser = () => {
    navigate('/')
    dispatch(logout())
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className='shadow bg-white dark:bg-slate-900 transition-colors duration-300 sticky top-0 z-50'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 dark:text-slate-200 transition-colors'>
        
        {/* Logo */}
        <Link to='/app' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <img src="/logo.svg" alt="" className='h-11 w-auto'/>
        </Link>

        {/* Right Side Actions */}
        <div className='flex items-center gap-4'>
          {/* Post Job Button (Desktop only) */}
          <button
            onClick={() => navigate('/app/jobs/create')}
            className='hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors'
          >
            <Plus className='size-4' />
            Post Job
          </button>

          {/* User Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors'
            >
              <div className='size-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold'>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className='max-sm:hidden font-medium'>{user?.name}</span>
              <ChevronDown className={`size-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50'>
                {/* User Info */}
                <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700'>
                  <p className='font-semibold text-slate-900 dark:text-white'>{user?.name}</p>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className='py-2'>
                  {/* My Resumes - NOW IN DROPDOWN */}
                  <Link
                    to='/app'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <FileText className='size-5' />
                    <span>My Resumes</span>
                  </Link>

                  <div className='my-2 border-t border-slate-200 dark:border-slate-700'></div>

                  <Link
                    to='/app/jobs/saved'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Bookmark className='size-5' />
                    <span>Saved Jobs</span>
                  </Link>

                  <Link
                    to='/app/discussions/saved'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Bookmark className='size-5' />
                    <span>Saved Discussions</span>
                  </Link>

                  <div className='my-2 border-t border-slate-200 dark:border-slate-700'></div>

                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      logoutUser()
                    }}
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors'
                  >
                    <LogOut className='size-5' />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className='md:hidden flex items-center justify-around px-4 py-2 border-t border-slate-200 dark:border-slate-700'>
        <Link
          to='/app'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/app'
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className='size-5' />
          <span className='text-xs font-medium'>Resumes</span>
        </Link>

        <Link
          to='/app/ats-analyzer'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isActive('/app/ats-analyzer')
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Target className='size-5' />
          <span className='text-xs font-medium'>ATS</span>
        </Link>

        <Link
          to='/app/jobs'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isActive('/app/jobs')
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Briefcase className='size-5' />
          <span className='text-xs font-medium'>Jobs</span>
        </Link>

        <Link
          to='/app/discussions'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isActive('/app/discussions')
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare className='size-5' />
          <span className='text-xs font-medium'>Forum</span>
        </Link>
      </div>
    </div>
  )
}

export default Navbar