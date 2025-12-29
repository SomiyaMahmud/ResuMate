import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus, FileSearch, Briefcase, MessageSquare, CalendarDays, FileCheck, Users, MessageCircle, BookOpen } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

const Dashboard = () => {
  const { user } = useSelector(state => state.auth)
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 bg-clip-text text-transparent sm:hidden'>
          {t('welcome')}, {user?.name}
        </p>

        {/* Quick Actions - with Planner added */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
          <button
            onClick={() => navigate('/app/my-resumes')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <Plus className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300'>{t('createResume')}</p>
          </button>

          <button
            onClick={() => navigate('/app/ats-analyzer')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <FileSearch className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-emerald-300 to-emerald-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300'>{t('atsChecking')}</p>
          </button>

          <button
            onClick={() => navigate('/app/jobs')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <Briefcase className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-blue-300 to-blue-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300'>{t('browseJobs')}</p>
          </button>

          <button
            onClick={() => navigate('/app/planner')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <CalendarDays className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-amber-300 to-amber-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-300'>{t('planner')}</p>
          </button>

          <button
            onClick={() => navigate('/app/resume-reviews')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-pink-500 dark:hover:border-pink-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <FileCheck className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-pink-300 to-pink-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-all duration-300'>{t('resumeReviews')}</p>
          </button>

          <button
            onClick={() => navigate('/app/network')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <Users className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-cyan-300 to-cyan-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-all duration-300'>{t('myNetwork')}</p>
          </button>

          <button
            onClick={() => navigate('/app/chat')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <MessageCircle className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-violet-300 to-violet-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all duration-300'>{t('messages')}</p>
          </button>

          <button
            onClick={() => navigate('/app/resources')}
            className='w-full bg-white dark:bg-slate-900 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <BookOpen className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-orange-300 to-orange-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-all duration-300'>{t('resources')}</p>
          </button>
        </div>

        {/* Community Discussions Link */}
        <button
          onClick={() => navigate('/app/discussions')}
          className='w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white rounded-xl p-6 mb-8 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300'
        >
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-xl'>
              <MessageSquare className='size-8' />
            </div>
            <div className='text-left'>
              <h3 className='text-xl font-bold mb-1'>{t('communityDiscussions')}</h3>
              <p className='text-white/80'>{t('communityDescription')}</p>
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