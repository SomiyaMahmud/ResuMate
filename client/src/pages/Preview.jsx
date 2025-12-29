import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import ResumePreview from '../components/ResumePreview'
import Loader from '../components/Loader'
import { ArrowLeftIcon } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

const Preview = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)

  const loadResume = async () => {
    setResumeData(dummyResumeData.find(resume => resume._id === resumeId || null))
    setIsLoading(false)
  }

  useEffect(() => {
    loadResume()
  }, [])

  return resumeData ? (
    <div className='bg-slate-50 dark:bg-slate-950 min-h-screen'>
      <div className='max-w-3xl mx-auto py-10'>
        <ResumePreview 
          data={resumeData} 
          template={resumeData.template} 
          accentColor={resumeData.accent_color} 
          className='py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl'
        />
      </div>
    </div>
  ) : (
    <div>
      {isLoading ? <Loader /> : (
        <div className='flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950'>
          <p className='text-center text-6xl text-slate-400 dark:text-slate-600 font-medium'>
            {t('resumeNotFound')}
          </p>
          <a 
            href="/" 
            className='mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-colors shadow-lg font-semibold'
          >
            <ArrowLeftIcon className='size-5' />
            {t('goToHomePage')}
          </a>
        </div>
      )}
    </div>
  )
}

export default Preview