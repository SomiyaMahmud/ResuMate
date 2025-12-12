import React from 'react'
import {useState,useEffect} from 'react'
import {PlusIcon,UploadCloudIcon,FilePenLineIcon,TrashIcon,PencilIcon, XIcon, UploadCloud, LoaderCircleIcon, FileSearch } from 'lucide-react';
import { dummyResumeData } from './../assets/assets';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import pdfToText from 'react-pdftotext'


const Dashboard = () => {
  const {user,token} = useSelector(state=> state.auth)

  const colors = ["#9333ea","#d97706","#dc2626","#0284c7","#16a34a"]
  const [allResumes,setAllResumes] = useState([]) 
  const [showCreateResume,setshowCreateResume] = useState(false) 
  const [showUploadResume,setshowUploadResume] = useState(false) 
  const [title,setTitle] = useState('') 
  const [resume,setResume] = useState(null) 
  const [editResumeId,setEditResumeId] = useState('') 

  const [isLoading,setIsLoading] = useState(false)

  const navigate = useNavigate()

  const loadAllResumes = async () => {
    try {
      const {data} = await api.get('/api/users/resumes', {headers:{Authorization: token}})
      setAllResumes(data.resumes)
    } catch (error) {
      toast.error(error?.response?.data?.messege || error.message)
    }
  }

  const createResume = async (event) => {
    try {
      event.preventDefault()
      const {data} = await api.post('/api/resumes/create', {title}, {headers:{Authorization: token}})
      setAllResumes([...allResumes, data.resume])
      setTitle('')
      setshowCreateResume(false)
      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.messege || error.message)      
    }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      if (!resume || !title.trim()) {
        toast.error("Please provide title and resume")
        setIsLoading(false)
        return
      }

      const resumeText = await pdfToText(resume)
      if (!resumeText.trim()) {
        toast.error("Failed to extract text from PDF")
        setIsLoading(false)
        return
      }

      const { data } = await api.post('/api/ai/upload-resume',{ title, resumeText },{headers:{Authorization: token}})
      setTitle('')
      setResume(null)
      setshowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.messege || error.message)   
    }
    setIsLoading(false)
  }

  const editTitle = async (event) => {
    try {
      event.preventDefault()
      const {data} = await api.put(`/api/resumes/update`, {resumeId: editResumeId,resumeData: {title}}, {headers:{Authorization: token}}) 
      setAllResumes(allResumes.map(resume=>resume._id === editResumeId ? { ...resume,title} : resume))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.messege || error.message)
    } 
  }

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm('Are Sure That You Want to Delete This Resume?')
      if (confirm){
        const {data} = await api.delete(`/api/resumes/delete/${resumeId}`,{headers:{Authorization: token}}) 
        setAllResumes(allResumes.filter(resume=>resume._id !== resumeId))
        toast.success(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.messege || error.message)
    }
  }

  useEffect(()=>{
    loadAllResumes()
  },[])

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name}
        </p>

        <div className='flex gap-4'>
          <button 
            onClick={()=>setshowCreateResume(true)} 
            className='w-full bg-white dark:bg-slate-900 sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <PlusIcon className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300'>Create Resume</p>
          </button>

          <button 
            onClick={()=>setshowUploadResume(true)} 
            className='w-full bg-white dark:bg-slate-900 sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <UploadCloudIcon className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300'>Upload Existing</p>
          </button>

          {/* NEW: ATS Checking Button */}
          <button 
            onClick={()=>navigate('/app/ats-analyzer')} 
            className='w-full bg-white dark:bg-slate-900 sm:max-w-42 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700 group hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <FileSearch className='size-11 transiton-all duration-300 p-2.5 bg-gradient-to-br from-emerald-300 to-emerald-500 text-white rounded-full'/>
            <p className='text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300'>ATS Checking</p>
          </button>
        </div>

        <hr className='border-slate-300 dark:border-slate-700 my-6 sm:w-[535px]'/>

        <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
          {
            allResumes.map((resume,index)=>{
              const baseColor = colors[index % colors.length];
              return(
                <button 
                  key={index} 
                  onClick={()=>navigate(`/app/builder/${resume._id}`)} 
                  className='relative w-full sm:max-w-62 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' 
                  style={{background:`linear-gradient(135deg,${baseColor}10,${baseColor}40)`,borderColor:baseColor+'40'}}
                >
                  <FilePenLineIcon className='size-7 group-hover:scale-105 transition-all' style={{color: baseColor}}/>
                  <p className='text-sm group-hover:scale-105 transition-all px-2 text-center' style={{color: baseColor}}>
                    {resume.title}
                  </p>
                  <p className='absolute bottom-1 text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-all duration-300 px-2 text-center'>
                    Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>

                  <div onClick={e=>e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                    <TrashIcon 
                      onClick={()=>deleteResume(resume._id)} 
                      className='size-8 p-1.5 hover:bg-white/50 dark:hover:bg-slate-900/50 rounded text-slate-700 dark:text-slate-300 transition-colors'
                    />
                    <PencilIcon 
                      onClick={()=>{setEditResumeId(resume._id);setTitle(resume.title)}} 
                      className='size-8 p-1.5 hover:bg-white/50 dark:hover:bg-slate-900/50 rounded text-slate-700 dark:text-slate-300 transition-colors'
                    />
                  </div>
                </button>
              )
            })
          }
        </div>

        {/* Create Resume Modal */}
        {showCreateResume && (
          <form 
            onSubmit={createResume} 
            onClick={()=>setshowCreateResume(false)} 
            className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'
          >
            <div 
              onClick={e=>e.stopPropagation()} 
              className='relative bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 shadow-md rounded-lg w-full max-w-sm p-6'
            >
              <h2 className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-100'>Create a New Resume</h2>
              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='Enter Your Resume Title' 
                className='w-full px-4 py-2 mb-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-green-600 dark:focus:border-green-500 ring-green-600 dark:ring-green-500 border-slate-300 dark:border-slate-700'  
                required
              />
              <button className='w-full py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors'>
                Create Resume
              </button>
              <XIcon 
                className='absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors' 
                onClick={()=>{setshowCreateResume(false);setTitle('')}}
              />
            </div>
          </form>
        )}

        {/* Upload Resume Modal */}
        {showUploadResume && (
          <form 
            onSubmit={uploadResume} 
            onClick={()=>setshowUploadResume(false)} 
            className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'
          >
            <div 
              onClick={e=>e.stopPropagation()} 
              className='relative bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 shadow-md rounded-lg w-full max-w-sm p-6'
            >
              <h2 className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-100'>Upload Resume</h2>

              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='Enter Your Resume Title' 
                className='w-full px-4 py-2 mb-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-green-600 dark:focus:border-green-500 ring-green-600 dark:ring-green-500 border-slate-300 dark:border-slate-700'  
                required
              />

              <div>
                <label htmlFor="resume-input" className='block text-sm text-slate-700 dark:text-slate-300'>
                  Select Resume File
                  <div className='flex flex-col justify-center items-center gap-2 border group text-slate-400 dark:text-slate-500 border-slate-400 dark:border-slate-600 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-600 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-500 cursor-pointer transition-colors bg-white dark:bg-slate-800'>
                    {resume? (
                      <p className='text-green-700 dark:text-green-500'>{resume.name}</p>
                    ):(
                      <>
                        <UploadCloud className='size-14 stroke-1'/>
                        <p>Upload Resume</p>
                      </>
                    )}
                  </div>
                </label>
                <input 
                  type="file" 
                  id='resume-input' 
                  accept='.pdf' 
                  hidden 
                  onChange={(e)=>setResume(e.target.files[0])}
                />
              </div>

              <button 
                disabled={isLoading} 
                className='w-full py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white'/>}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
              </button>

              <XIcon 
                className='absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors' 
                onClick={()=>{setshowUploadResume(false);setTitle('');setResume(null)}}
              />
            </div>
          </form>
        )}  

        {/* Edit Resume Title Modal */}
        {editResumeId && (
          <form 
            onSubmit={editTitle} 
            onClick={()=>setEditResumeId('')} 
            className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'
          >
            <div 
              onClick={e=>e.stopPropagation()} 
              className='relative bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 shadow-md rounded-lg w-full max-w-sm p-6'
            >
              <h2 className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-100'>Edit Resume Title</h2>
              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='Enter Your Resume Title' 
                className='w-full px-4 py-2 mb-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-green-600 dark:focus:border-green-500 ring-green-600 dark:ring-green-500 border-slate-300 dark:border-slate-700'  
                required
              />
              <button className='w-full py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors'>
                Update
              </button>
              <XIcon 
                className='absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors' 
                onClick={()=>{setEditResumeId('');setTitle('')}}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard