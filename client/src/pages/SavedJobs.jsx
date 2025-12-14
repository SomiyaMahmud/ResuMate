import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { Bookmark, MapPin, Briefcase, Building2, Clock, BookmarkX } from 'lucide-react'

const SavedJobs = () => {
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const [savedJobs, setSavedJobs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSavedJobs()
    }, [])

    const loadSavedJobs = async () => {
        try {
            const { data } = await api.get('/api/jobs/saved', {
                headers: { Authorization: token }
            })
            setSavedJobs(data.jobs)
        } catch (error) {
            toast.error('Failed to load saved jobs')
        }
        setLoading(false)
    }

    const handleUnsave = async (jobId) => {
        try {
            await api.post(`/api/jobs/save/${jobId}`, {}, {
                headers: { Authorization: token }
            })
            setSavedJobs(savedJobs.filter(job => job._id !== jobId))
            toast.success('Job removed from saved')
        } catch (error) {
            toast.error('Failed to remove job')
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='flex items-center gap-3 mb-8'>
                    <Bookmark className='size-8 text-indigo-600 dark:text-indigo-400' />
                    <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                        Saved Jobs
                    </h1>
                </div>

                {savedJobs.length === 0 ? (
                    <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <Bookmark className='size-16 mx-auto mb-4 text-slate-300 dark:text-slate-600' />
                        <p className='text-lg text-slate-600 dark:text-slate-400 mb-4'>No saved jobs yet</p>
                        <button
                            onClick={() => navigate('/app/jobs')}
                            className='text-indigo-600 dark:text-indigo-400 hover:underline'
                        >
                            Browse jobs
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {savedJobs.map(job => (
                            <div
                                key={job._id}
                                className='bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow'
                            >
                                <div className='flex items-start justify-between'>
                                    <div
                                        onClick={() => navigate(`/app/jobs/${job._id}`)}
                                        className='flex gap-4 flex-1 cursor-pointer'
                                    >
                                        <div className='size-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                                            {job.companyLogo ? (
                                                <img src={job.companyLogo} alt={job.company} className='size-12 object-contain' />
                                            ) : (
                                                <Building2 className='size-8 text-indigo-600 dark:text-indigo-400' />
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-1'>
                                                {job.title}
                                            </h3>
                                            <p className='text-slate-600 dark:text-slate-400 mb-3'>{job.company}</p>
                                            <div className='flex flex-wrap gap-2'>
                                                <span className='px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium'>
                                                    {job.jobType}
                                                </span>
                                                <span className='px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1'>
                                                    <MapPin className='size-3' />
                                                    {job.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(job._id)}
                                        className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                    >
                                        <BookmarkX className='size-6 text-red-600 dark:text-red-400' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedJobs