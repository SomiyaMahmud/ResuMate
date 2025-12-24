import React from 'react'
import {useState,useEffect} from 'react'
import {PlusIcon,UploadCloudIcon,FilePenLineIcon,TrashIcon,PencilIcon, XIcon, UploadCloud, CalendarDays } from 'lucide-react';
import { dummyResumeData } from './../assets/assets';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

const Dashboard = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const colors = ["#9333ea","#d97706","#dc2626","#0284c7","#16a34a"]
  const [allResumes,setAllResumes] = useState([]) 
  const [showCreateResume,setshowCreateResume] = useState(false) 
  const [showUploadResume,setshowUploadResume] = useState(false) 
  const [title,setTitle] = useState('') 
  const [resume,setResume] = useState(null) 
  const [editResumeId,setEditResumeId] = useState('') 
  const navigate = useNavigate()


  const loadAllResumes = async () => {
    setAllResumes(dummyResumeData)
  }

  const createResume = async (event) => {
    event.preventDefault()
    setshowCreateResume(false)
    navigate(`/app/builder/res123`)
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setshowUploadResume(false)
    navigate(`/app/builder/res123`)
  }

  const editTitle = async (event) => {
    event.preventDefault()
  }

  const deleteResume = async (resumeId) => {
    const confirm = window.confirm(t('deleteConfirm'))
    if (confirm){
      setAllResumes(prev=>prev.filter(resume=>resume._id !== resumeId))
    }
  }

  useEffect(()=>{
    loadAllResumes()
  },[])
  return (
      <div>
        <div className = 'max-w-7xl mx-auto px-4 py-8'>
          <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>Welcome, Dot Baba</p>

          <div className='flex gap-4'>
            <button onClick={()=>setshowCreateResume(true)} className='w-full bg-white sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <PlusIcon className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full'/>
              <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>{t('createResume')}</p>
            </button>
            <button onClick={()=>setshowUploadResume(true)} className='w-full bg-white sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <UploadCloudIcon className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full'/>
              <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>{t('uploadResume')}</p>
            </button>
            <button onClick={()=>navigate('/app/planner')} className='w-full bg-white sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <CalendarDays className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-emerald-300 to-emerald-500 text-white rounded-full'/>
              <p className='text-sm group-hover:text-emerald-600 transition-all duration-300'>Planner</p>
            </button>
          </div>
          <hr className='border-slate-300 my-6 sm:w-[355px]'/>

          <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
            {
              allResumes.map((resume,index)=>{
                const baseColor = colors[index % colors.length];
                return(
                  <button key={index} onClick={()=>navigate(`/app/builder/${resume._id}`)} className = 'relative w-full sm:max-w-62 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{background:`linear-gradient(135deg,${baseColor}10,${baseColor}40)`,borderColor:baseColor+'40'}}>
                      <FilePenLineIcon className='size-7 group-hover:scale-105 transition-all' style={{color: baseColor}}/>
                      <p className='text-sm group-hover:scale-105 transition-all px-2 text-center' style={{color: baseColor}}>{resume.title}</p>
                      <p className='absolute bottom-1 text-[20px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{color: baseColor}}>
                        Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>

                      <div onClick={e=>e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                        <TrashIcon onClick={()=>deleteResume(resume._id)} className='size-8 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors'/>
                        <PencilIcon onClick={()=>{setEditResumeId(resume._id);setTitle(resume.title)}} className='size-8 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors'/>
                      </div>
                  </button>
                )
              })
            }
          </div>

          {showCreateResume && (
            <form onSubmit={createResume} onClick={()=>setshowCreateResume(flase)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
              <div onClick={e=>e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                <h2 className='text-xl font-bold mb-4'>{t('createResume')}</h2>
                <input onChange={(e)=>setTitle(e.target.value)} value={title}type="text" placeholder={t('enterResumeTitle')} className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600'  required/>
                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>{t('create')}</button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>{setshowCreateResume(false);setTitle('')}}/>

              </div>
            </form>
          )
          }

          {showUploadResume && (
            <form onSubmit={uploadResume} onClick={()=>setshowUploadResume(flase)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
              <div onClick={e=>e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                <h2 className='text-xl font-bold mb-4'>{t('uploadResume')}</h2>

                <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder={t('enterResumeTitle')} className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600'  required/>

                <div>
                  <label htmlFor="resume-input" className='block text-sm text-slate-700'>
                    {t('chooseFile')}
                    <div className='flex flex-col justify-center items-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-600 hover:text-green-700 cursor-pointer transition-colors'>
                      {resume? (
                        <p className='text-green-700'>{resume.name}</p>
                      ):(
                        <>
                          <UploadCloud className='size-14 stroke-1'/>
                          <p>{t('uploadResume')}</p>
                        </>
                      )}
                    </div>
                  </label>
                  <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e)=>setResume(e.target.files[0])}/>
                </div>

                <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>{t('upload')}</button>

                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>{setshowUploadResume(false);setTitle('')}}/>
              </div>
            </form>
          )
          }  

          {editResumeId && (
              <form onSubmit={editTitle} onClick={()=>setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
                <div onClick={e=>e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                  <h2 className='text-xl font-bold mb-4'>{t('editResume')}</h2>
                  <input onChange={(e)=>setTitle(e.target.value)} value={title}type="text" placeholder={t('enterResumeTitle')} className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600'  required/>
                  <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>{t('saveChanges')}</button>
                  <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>{setEditResumeId('');setTitle('')}}/>

                </div>
              </form>
            )
          }
        </div>
        
      </div>
  )
}

export default Dashboard