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
    const [allCoverLetters, setAllCoverLetters] = useState([])
    const [activeTab, setActiveTab] = useState('resumes')
    const [showCreateResume, setShowCreateResume] = useState(false)
    const [showUploadResume, setShowUploadResume] = useState(false)
    const [title, setTitle] = useState('')
    const [resume, setResume] = useState(null)
    const [editResumeId, setEditResumeId] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const loadData = async () => {
        try {
            const timestamp = new Date().getTime()
            
            const [resumesRes, coverLettersRes] = await Promise.all([
                api.get(`/api/users/resumes?t=${timestamp}`, { headers: { Authorization: token } }),
                api.get(`/api/cover-letters/my?t=${timestamp}`, { headers: { Authorization: token } })
            ]);

            setAllResumes(resumesRes.data.resumes || [])
            setAllCoverLetters(coverLettersRes.data.coverLetters || [])
        } catch (error) {
            console.error("Load data error:", error)
            toast.error("Failed to load documents")
        }
    }

    const createResume = async (event) => {
        try {
            event.preventDefault()
            const { data } = await api.post('/api/resumes/create', { title }, {
                headers: { Authorization: token }
            })
            setAllResumes([...allResumes, data.resume])
            setTitle('')
            setShowCreateResume(false)
            navigate(`/app/builder/${data.resume._id}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create resume")
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

            const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, {
                headers: { Authorization: token }
            })
            setTitle('')
            setResume(null)
            setShowUploadResume(false)
            navigate(`/app/builder/${data.resumeId}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to upload resume")
        }
        setIsLoading(false)
    }

    const editTitle = async (event) => {
        try {
            event.preventDefault()
            const { data } = await api.put(`/api/resumes/update`, {
                resumeId: editResumeId,
                resumeData: { title }
            }, {
                headers: { Authorization: token }
            })

            // Update state immediately
            setAllResumes(allResumes.map(resume =>
                resume._id === editResumeId ? { ...resume, title } : resume
            ))

            setTitle('')
            setEditResumeId('')
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update title")
        }
    }

    const deleteResume = async (resumeId) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this resume?')
            if (confirm) {
                // Optimistically update UI immediately
                setAllResumes(prevResumes => prevResumes.filter(resume => resume._id !== resumeId))

                // Then make the API call
                const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
                    headers: { Authorization: token }
                })

                toast.success(data.message)

                // Reload from server to ensure sync
                await loadData()
            }
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error?.response?.data?.message || "Failed to delete resume")
            // Reload resumes to restore UI if delete failed
            await loadData()
        }
    }

    const deleteCoverLetter = async (clId) => {
        if (window.confirm("Are you sure you want to delete this cover letter?")) {
            try {
                setAllCoverLetters(prev => prev.filter(cl => cl._id !== clId));
                await api.delete(`/api/cover-letters/${clId}`, {
                    headers: { Authorization: token }
                });
                toast.success("Cover letter deleted");
            } catch (error) {
                toast.error("Failed to delete cover letter");
                loadData();
            }
        }
    }

    useEffect(() => {
        if (token) {
            loadData()
        }
    }, [token])

    return (
        <div className='min-h-screen bg-white'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900 mb-2'>My Documents</h1>
                        <p className='text-slate-500'>Manage your resumes and cover letters</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('resumes')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'resumes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Resumes
                        </button>
                        <button
                            onClick={() => setActiveTab('cover-letters')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cover-letters' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Cover Letters
                        </button>
                    </div>
                </div>

                {activeTab === 'resumes' ? (
                    <>
                        <div className='flex justify-end mb-6 gap-3'>
                            <button
                                onClick={() => setShowCreateResume(true)}
                                className='flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200'
                            >
                                <Plus className='size-5' />
                                Create New
                            </button>
                            <button
                                onClick={() => setShowUploadResume(true)}
                                className='flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-purple-200'
                            >
                                <UploadCloud className='size-5' />
                                Upload
                            </button>
                        </div>

                        {allResumes.length === 0 ? (
                            <div className='text-center py-20 bg-gray-50 rounded-2xl border border-gray-200'>
                                <FileText className='size-20 mx-auto mb-4 text-gray-300' />
                                <h2 className='text-2xl font-bold text-slate-900 mb-2'>No resumes yet</h2>
                                <p className='text-slate-600 mb-6'>Create your first resume to get started</p>
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
                                            className='relative group bg-white rounded-xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden'
                                            style={{ borderColor: baseColor + '40' }}
                                        >
                                            <div
                                                className='h-2'
                                                style={{ background: `linear-gradient(90deg, ${baseColor}, ${baseColor}cc)` }}
                                            />
                                            <div className='p-6'>
                                                <FileText className='size-12 mb-4 group-hover:scale-110 transition-transform' style={{ color: baseColor }} />
                                                <h3 className='text-lg font-semibold text-slate-900 mb-2 line-clamp-2'>
                                                    {resume.title}
                                                </h3>
                                                <p className='text-sm text-slate-500'>
                                                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div
                                                onClick={e => e.stopPropagation()}
                                                className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'
                                            >
                                                <button
                                                    onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }}
                                                    className='p-2 bg-white hover:bg-slate-100 rounded-lg shadow-md transition-colors'
                                                >
                                                    <Edit2 className='size-4 text-slate-700' />
                                                </button>
                                                <button
                                                    onClick={() => deleteResume(resume._id)}
                                                    className='p-2 bg-white hover:bg-red-100 rounded-lg shadow-md transition-colors'
                                                >
                                                    <Trash2 className='size-4 text-red-600' />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className='flex justify-end mb-6'>
                            <button
                                onClick={() => navigate('/app/cover-letter/builder/new')}
                                className='flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200'
                            >
                                <Plus className='size-5' />
                                Create Cover Letter
                            </button>
                        </div>

                        {allCoverLetters.length === 0 ? (
                            <div className='text-center py-20 bg-gray-50 rounded-2xl border border-gray-200'>
                                <FileText className='size-20 mx-auto mb-4 text-gray-300' />
                                <h2 className='text-2xl font-bold text-slate-900 mb-2'>No cover letters yet</h2>
                                <p className='text-slate-600 mb-6'>Create a professional cover letter in minutes</p>
                                <button
                                    onClick={() => navigate('/app/cover-letter/builder/new')}
                                    className='inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'
                                >
                                    <Plus className='size-5' />
                                    Create Cover Letter
                                </button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                                {allCoverLetters.map((cl, index) => {
                                    const baseColor = colors[(index + 2) % colors.length];
                                    return (
                                        <div
                                            key={cl._id}
                                            onClick={() => navigate(`/app/cover-letter/builder/${cl._id}`)}
                                            className='relative group bg-white rounded-xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden'
                                            style={{ borderColor: baseColor + '40' }}
                                        >
                                            <div
                                                className='h-2'
                                                style={{ background: `linear-gradient(90deg, ${baseColor}, ${baseColor}cc)` }}
                                            />
                                            <div className='p-6'>
                                                <div className="flex justify-between items-start mb-4">
                                                    <FileText className='size-12 group-hover:scale-110 transition-transform' style={{ color: baseColor }} />
                                                    <div className="size-6 rounded-full" style={{ backgroundColor: cl.accentColor }}></div>
                                                </div>
                                                <h3 className='text-lg font-semibold text-slate-900 mb-2 line-clamp-2'>
                                                    {cl.title}
                                                </h3>
                                                <p className='text-sm text-slate-500'>
                                                    Updated {new Date(cl.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div
                                                onClick={e => e.stopPropagation()}
                                                className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'
                                            >
                                                <button
                                                    onClick={() => deleteCoverLetter(cl._id)}
                                                    className='p-2 bg-white hover:bg-red-100 rounded-lg shadow-md transition-colors'
                                                >
                                                    <Trash2 className='size-4 text-red-600' />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Create Resume Modal */}
                {
                    showCreateResume && (
                        <form
                            onSubmit={createResume}
                            onClick={() => setShowCreateResume(false)}
                            className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                className='relative bg-white border shadow-xl rounded-2xl w-full max-w-md p-8'
                            >
                                <h2 className='text-2xl font-bold mb-6 text-slate-900'>Create New Resume</h2>
                                <input
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                    type="text"
                                    placeholder="Enter resume title"
                                    className='w-full px-4 py-3 mb-6 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors'
                                    required
                                    autoFocus
                                />
                                <button className='w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'>
                                    Create Resume
                                </button>
                                <button
                                    type='button'
                                    onClick={() => { setShowCreateResume(false); setTitle('') }}
                                    className='absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors'
                                >
                                    <X className='size-5 text-slate-400' />
                                </button>
                            </div>
                        </form>
                    )
                }

                {/* Upload Resume Modal */}
                {
                    showUploadResume && (
                        <form
                            onSubmit={uploadResume}
                            onClick={() => setShowUploadResume(false)}
                            className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                className='relative bg-white border shadow-xl rounded-2xl w-full max-w-md p-8'
                            >
                                <h2 className='text-2xl font-bold mb-6 text-slate-900'>Upload Resume</h2>
                                <input
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                    type="text"
                                    placeholder="Enter resume title"
                                    className='w-full px-4 py-3 mb-4 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors'
                                    required
                                />
                                <label htmlFor="resume-input" className='block'>
                                    <div className='flex flex-col justify-center items-center gap-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-8 cursor-pointer transition-colors bg-slate-50'>
                                        {resume ? (
                                            <>
                                                <FileText className='size-12 text-purple-600' />
                                                <p className='text-purple-700 font-medium'>{resume.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className='size-12 text-slate-400' />
                                                <p className='text-slate-600'>Click to upload PDF</p>
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
                                    className='absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors'
                                >
                                    <X className='size-5 text-slate-400' />
                                </button>
                            </div>
                        </form>
                    )
                }

                {/* Edit Resume Title Modal */}
                {
                    editResumeId && (
                        <form
                            onSubmit={editTitle}
                            onClick={() => setEditResumeId('')}
                            className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                className='relative bg-white border shadow-xl rounded-2xl w-full max-w-md p-8'
                            >
                                <h2 className='text-2xl font-bold mb-6 text-slate-900'>Edit Resume Title</h2>
                                <input
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                    type="text"
                                    placeholder="Enter resume title"
                                    className='w-full px-4 py-3 mb-6 bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors'
                                    required
                                    autoFocus
                                />
                                <button className='w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors'>
                                    Update Title
                                </button>
                                <button
                                    type='button'
                                    onClick={() => { setEditResumeId(''); setTitle('') }}
                                    className='absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors'
                                >
                                    <X className='size-5 text-slate-400' />
                                </button>
                            </div>
                        </form>
                    )
                }
            </div >
        </div >
    )
}

export default MyResumes