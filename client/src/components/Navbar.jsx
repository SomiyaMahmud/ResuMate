import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../app/features/authSlice'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import LanguageSelector from './LanguageSelector'

const Navbar = () => {
  const { user } = useSelector(state => state.auth)
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const logoutUser = ()=>{
    dispatch(logout())
    navigate('/')
  }
  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <Link>
          <img src="/logo.svg" alt="" className='h-11 w-auto'/>
        </Link>
        <div className='flex items-center gap-4 text-sm'>
          <LanguageSelector />
          <p className='max-sm:hidden'>{t('hi')}, {user?.name}</p>
          <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>
            {t('logout')}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar