import React from 'react'
import {Lock, Mail, User2Icon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import api from '../configs/api.js';
import { login } from '../app/features/authSlice.js';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import LanguageSelector from '../components/LanguageSelector'

const Login = () => {

    const dispatch = useDispatch()
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)

    const query = new URLSearchParams(window.location.search)
    const urlState = query.get('state')

    const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const {data} = await api.post(`/api/users/${state}`,formData)
            dispatch(login(data))
            localStorage.setItem('token',data.token)
            toast.success(data.message)
        } catch (error) {
            toast(error?.response?.data?.messege || error.message)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-500'>
        {/* Language Selector - Positioned top-right */}
        <div className="absolute top-6 right-6">
          <LanguageSelector />
        </div>

        <form onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
          <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? t('login') : t('signUp')}</h1>
          <p className="text-gray-500 text-sm mt-2">{state === "login" ? t('pleaseLogin') : t('pleaseSignup')}</p>
          {state !== "login" && (
              <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                  <User2Icon size={16} color='#6B7280'/>
                  <input type="text" name="name" placeholder={t('name')} className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
              </div>
          )}
          <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Mail size={13} color='#6B7280'/>
              <input type="email" name="email" placeholder={t('email')} className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Lock size={13} color='#6B7280'/>
              <input type="password" name="password" placeholder={t('password')} className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="mt-4 text-left text-green-500">
              <button className="text-sm" type="reset">Forget password?</button>
          </div>
          <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
              {state === "login" ? t('login') : t('signUp')}
          </button>
          <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? t('dontHaveAccount') : t('alreadyHaveAccount')} <a href="#" className="text-green-600 hover:underline">{t('clickHere')}</a></p>
        </form>
      </div>
  )
}

export default Login