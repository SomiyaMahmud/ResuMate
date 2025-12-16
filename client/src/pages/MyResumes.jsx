import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { FileText, Trash2, Edit2, Plus, UploadCloud, X, LoaderCircle } from 'lucide-react'
import pdfToText from 'react-pdftotext'

const MyResumes = () => {
    const { user, token } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
    const [allResumes, setAllResumes] = useState([])
    const [showCreateResume, setShowCreateResume] = useState(false)
    const [showUploadResume, setShowUploadResume] = useState(false)
    const [title, setTitle] = useState('')
    const [resume, setResume] = useState(null)
    const [editResumeId, setEditResumeId] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const loadAllResumes = async () => {
        try {
            const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } })
            setAllResumes(data.resumes)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const createResume = async (event) => {
        try {
            event.preventDefault()
            const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: token } })
            setAllResumes([...allResumes, data.resume])
            setTitle('')
            setShowCreateResume(false)
            navigate(`/app/builder/${data.resume._id}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
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

            const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token } })
            setTitle('')
            setResume(null)
            setShowUploadResume(false)
            navigate(`/app/builder/${data.resumeId}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
        setIsLoading(false)
    }

    const editTitle = async (event) => {
        try {
            event.preventDefault()
            const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } })
            setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
            setTitle('')
            setEditResumeId('')
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    const deleteResume = async (resumeId) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this resume?')
            if (confirm) {
                const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: token } })
                setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        loadAllResumes()
    }, [])

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>My Resumes</h1>
                        <p className='text-slate-600 dark:text-slate-400'>{allResumes.length} resume{allResumes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => setShowCreateResume(true)}
                            className='flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg'
                        >
                            <Plus className='size-5' />
                            Create New
                        </button>
                        <button
                            onClick={() => setShowUploadResume(true)}
                            className='flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors shadow-lg'
                        >
                            <UploadCloud className='size-5' />
                            Upload
                        </button>
                    </div>
                </div>

                {allResumes.length === 0 ? (
                    <div className='text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800'>
                        <FileText className='size-20 mx-auto mb-4 text-slate-300 dark:text-slate-600' />
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>No resumes yet</h2>
                        <p className='text-slate-600 dark:text-slate-400 mb-6'>Create your first resume to get started</p>
                        <button
                            onClick={() => setShowCreateResume(true)}
                            className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'
                        >
                            <Plus className='size-5' />
                            Create Resume
                        </button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {allResumes.map((resume, index) => {
                            const baseColor = colors[index % colors.length];
                            return (
                                <div
                                    key={resume._id}
                                    onClick={() => navigate(`/app/builder/${resume._id}`)}
                                    className='relative group bg-white dark:bg-slate-900 rounded-xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden'
                                    style={{ borderColor: baseColor + '40' }}
                                >
                                    <div
                                        className='h-2'
                                        style={{ background: `linear-gradient(90deg, ${baseColor}, ${baseColor}cc)` }}
                                    />
                                    <div className='p-6'>
                                        <FileText className='size-12 mb-4 group-hover:scale-110 transition-transform' style={{ color: baseColor }} />
                                        <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2'>
                                            {resume.title}
                                        </h3>
                                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div
                                        onClick={e => e.stopPropagation()}
                                        className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'
                                    >
                                        <button
                                            onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }}
                                            className='p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-md transition-colors'
                                        >
                                            <Edit2 className='size-4 text-slate-700 dark:text-slate-300' />
                                        </button>
                                        <button
                                            onClick={() => deleteResume(resume._id)}
                                            className='p-2 bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg shadow-md transition-colors'
                                        >
                                            <Trash2 className='size-4 text-red-600 dark:text-red-400' />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Create Resume Modal */}
                {showCreateResume && (
                    <form
                        onSubmit={createResume}
                        onClick={() => setShowCreateResume(false)}
                        className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className='relative bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-xl rounded-2xl w-full max-w-md p-8'
                        >
                            <h2 className='text-2xl font-bold mb-6 text-slate-900 dark:text-white'>Create New Resume</h2>
                            <input
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                type="text"
                                placeholder='Enter resume title'
                                className='w-full px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors'
                                required
                                autoFocus
                            />
                            <button className='w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'>
                                Create Resume
                            </button>
                            <button
                                type='button'
                                onClick={() => { setShowCreateResume(false); setTitle('') }}
                                className='absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                            >
                                <X className='size-5 text-slate-400 dark:text-slate-500' />
                            </button>
                        </div>
                    </form>
                )}

                {/* Upload Resume Modal */}
                {showUploadResume && (
                    <form
                        onSubmit={uploadResume}
                        onClick={() => setShowUploadResume(false)}
                        className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className='relative bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-xl rounded-2xl w-full max-w-md p-8'
                        >
                            <h2 className='text-2xl font-bold mb-6 text-slate-900 dark:text-white'>Upload Resume</h2>
                            <input
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                type="text"
                                placeholder='Enter resume title'
                                className='w-full px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors'
                                required
                            />
                            <label htmlFor="resume-input" className='block'>
                                <div className='flex flex-col justify-center items-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-8 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800'>
                                    {resume ? (
                                        <>
                                            <FileText className='size-12 text-purple-600 dark:text-purple-400' />
                                            <p className='text-purple-700 dark:text-purple-400 font-medium'>{resume.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className='size-12 text-slate-400 dark:text-slate-500' />
                                            <p className='text-slate-600 dark:text-slate-400'>Click to upload PDF</p>
                                        </>
                                    )}
                                </div>
                            </label>
                            <input
                                type="file"
                                id='resume-input'
                                accept='.pdf'
                                hidden
                                onChange={(e) => setResume(e.target.files[0])}
                            />
                            <button
                                disabled={isLoading}
                                className='w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2'
                            >
                                {isLoading && <LoaderCircle className='animate-spin size-5' />}
                                {isLoading ? 'Uploading...' : 'Upload Resume'}
                            </button>
                            <button
                                type='button'
                                onClick={() => { setShowUploadResume(false); setTitle(''); setResume(null) }}
                                className='absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                            >
                                <X className='size-5 text-slate-400 dark:text-slate-500' />
                            </button>
                        </div>
                    </form>
                )}

                {/* Edit Resume Title Modal */}
                {editResumeId && (
                    <form
                        onSubmit={editTitle}
                        onClick={() => setEditResumeId('')}
                        className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className='relative bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-xl rounded-2xl w-full max-w-md p-8'
                        >
                            <h2 className='text-2xl font-bold mb-6 text-slate-900 dark:text-white'>Edit Resume Title</h2>
                            <input
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                type="text"
                                placeholder='Enter resume title'
                                className='w-full px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors'
                                required
                                autoFocus
                            />
                            <button className='w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'>
                                Update Title
                            </button>
                            <button
                                type='button'
                                onClick={() => { setEditResumeId(''); setTitle('') }}
                                className='absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                            >
                                <X className='size-5 text-slate-400 dark:text-slate-500' />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default MyResumes