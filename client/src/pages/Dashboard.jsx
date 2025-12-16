import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PlusIcon, UploadCloudIcon, FileSearch, Briefcase, MessageSquare } from 'lucide-react'

const Dashboard = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name}
        </p>

        {/* Quick Actions - WITHOUT "My Resumes" option */}
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8'>
          <button 
            onClick={() => navigate('/app/my-resumes')} 
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <PlusIcon className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300'>Create Resume</p>
          </button>

          <button 
            onClick={() => navigate('/app/ats-analyzer')} 
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <FileSearch className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-emerald-300 to-emerald-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300'>ATS Checking</p>
          </button>

          <button 
            onClick={() => navigate('/app/jobs')} 
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <Briefcase className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-blue-300 to-blue-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300'>Browse Jobs</p>
          </button>
        </div>

        {/* Community Discussions Link */}
        <button 
          onClick={() => navigate('/app/discussions')} 
          className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl p-6 mb-8 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300'
        >
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-xl'>
              <MessageSquare className='size-8' />
            </div>
            <div className='text-left'>
              <h3 className='text-xl font-bold mb-1'>Community Discussions</h3>
              <p className='text-white/80'>Get career advice and connect with others</p>
            </div>
          </div>
          <svg className='size-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Dashboard