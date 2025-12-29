import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

import {
    ArrowLeft, MapPin, Briefcase, Building2, Clock, DollarSign,
    Calendar, Users, GraduationCap, BookmarkCheck, Bookmark,
    ExternalLink, Mail, Share2, Eye
} from 'lucide-react'

const JobDetails = () => {
    
    const { jobId } = useParams()
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        loadJob()
    }, [jobId])

    const loadJob = async () => {
        try {
            const { data } = await api.get(`/api/jobs/${jobId}`)
            setJob(data.job)
            setIsSaved(data.job.savedBy?.includes('current-user'))
        } catch (error) {
            toast.error('Failed to load job')
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!token) {
            toast.error('Please login to save jobs')
            return
        }

        try {
            const { data } = await api.post(`/api/jobs/save/${jobId}`, {}, {
                headers: { Authorization: token }
            })
            setIsSaved(data.isSaved)
            toast.success(data.message)
        } catch (error) {
            toast.error('Failed to save job')
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Job not found</h2>
                    <button onClick={() => navigate('/app/jobs')} className='text-indigo-600 hover:underline'>
                        {t('backToJobs')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-5xl mx-auto px-4 py-8'>
                
                {/* Back Button */}
                <button
                    onClick={() => navigate('/app/jobs')}
                    className='flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6'
                >
                    <ArrowLeft className='size-5' />
                    Back to Jobs
                </button>

                {/* Main Card */}
                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden'>
                    
                    {/* Header */}
                    <div className='bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white'>
                        <div className='flex items-start justify-between'>
                            <div className='flex gap-4 flex-1'>
                                <div className='size-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0'>
                                    {job.companyLogo ? (
                                        <img src={job.companyLogo} alt={job.company} className='size-16 object-contain' />
                                    ) : (
                                        <Building2 className='size-10 text-indigo-600' />
                                    )}
                                </div>
                                <div>
                                    <h1 className='text-3xl font-bold mb-2'>{job.title}</h1>
                                    <p className='text-xl opacity-90 mb-4'>{job.company}</p>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium'>
                                            {job.jobType}
                                        </span>
                                        <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1'>
                                            <MapPin className='size-4' />
                                            {job.location}
                                        </span>
                                        <span className='px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium'>
                                            {job.workplaceType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className='flex gap-2'>
                                <button
                                    onClick={handleShare}
                                    className='p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors'
                                >
                                    <Share2 className='size-6' />
                                </button>
                                <button
                                    onClick={handleSave}
                                    className='p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors'
                                >
                                    {isSaved ? (
                                        <BookmarkCheck className='size-6' />
                                    ) : (
                                        <Bookmark className='size-6' />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='p-8'>
                        
                        {/* Quick Info Grid */}
                        <div className='grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700'>
                            {job.salaryMin && (
                                <div className='flex items-start gap-3'>
                                    <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                                        <DollarSign className='size-5 text-green-600 dark:text-green-400' />
                                    </div>
                                    <div>
                                        <p className='text-sm text-slate-600 dark:text-slate-400'>{t('salaryRange')}</p>
                                        <p className='font-semibold text-slate-900 dark:text-white'>
                                            {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()} {job.salaryCurrency}
                                        </p>
                                        <p className='text-xs text-slate-500 dark:text-slate-400'>{job.salaryPeriod}</p>
                                    </div>
                                </div>
                            )}

                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                                    <Briefcase className='size-5 text-blue-600 dark:text-blue-400' />
                                </div>
                                <div>
                                    <p className='text-sm text-slate-600 dark:text-slate-400'>{t('experienceLabel')}</p>
                                    <p className='font-semibold text-slate-900 dark:text-white'>
                                        {job.experienceMin} - {job.experienceMax || '+'} years
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
                                    <GraduationCap className='size-5 text-purple-600 dark:text-purple-400' />
                                </div>
                                <div>
                                    <p className='text-sm text-slate-600 dark:text-slate-400'>{t('educationLabel')}</p>
                                    <p className='font-semibold text-slate-900 dark:text-white'>{job.educationLevel}</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg'>
                                    <Calendar className='size-5 text-amber-600 dark:text-amber-400' />
                                </div>
                                <div>
                                    <p className='text-sm text-slate-600 dark:text-slate-400'>{t('deadline')}</p>
                                    <p className='font-semibold text-slate-900 dark:text-white'>
                                        {job.applicationDeadline 
                                            ? new Date(job.applicationDeadline).toLocaleDateString()
                                            : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-slate-100 dark:bg-slate-800 rounded-lg'>
                                    <Eye className='size-5 text-slate-600 dark:text-slate-400' />
                                </div>
                                <div>
                                    <p className='text-sm text-slate-600 dark:text-slate-400'>{t('views')}</p>
                                    <p className='font-semibold text-slate-900 dark:text-white'>{job.views} {t('views')}</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-slate-100 dark:bg-slate-800 rounded-lg'>
                                    <Clock className='size-5 text-slate-600 dark:text-slate-400' />
                                </div>
                                <div>
                                    <p className='text-sm text-slate-600 dark:text-slate-400'>{t('posted')}</p>
                                    <p className='font-semibold text-slate-900 dark:text-white'>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className='mb-8'>
                            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>{t('jobDescription')}</h2>
                            <div className='prose dark:prose-invert max-w-none'>
                                <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>{t('requirements')}</h2>
                                <div className='prose dark:prose-invert max-w-none'>
                                    <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                        {job.requirements}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Responsibilities */}
                        {job.responsibilities && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>{t('responsibilities')}</h2>
                                <div className='prose dark:prose-invert max-w-none'>
                                    <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                        {job.responsibilities}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>{t('benefits')}</h2>
                                <div className='prose dark:prose-invert max-w-none'>
                                    <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                        {job.benefits}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {job.skills?.length > 0 && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>{t('requiredSkills')}</h2>
                                <div className='flex flex-wrap gap-2'>
                                    {job.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className='px-4 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium'
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Apply Section */}
                        <div className='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800'>
                            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>{t('howToApply')}</h2>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                {job.applicationEmail && (
                                    <a
                                        href={`mailto:${job.applicationEmail}`}
                                        className='flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors'
                                    >
                                        <Mail className='size-5' />
                                        {t('applyViaEmail')}
                                    </a>
                                )}
                                {job.applicationUrl && (
                                    <a
                                        href={job.applicationUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors'
                                    >
                                        <ExternalLink className='size-5' />
                                        {t('applyOnWebsite')}
                                    </a>
                                )}
                                {!job.applicationEmail && !job.applicationUrl && (
                                    <p className='text-slate-600 dark:text-slate-400'>
                                        Please contact the company directly for application details.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDetails