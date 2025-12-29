import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import {
    Search, MapPin, Briefcase, Building2, Filter,
    Bookmark, BookmarkCheck, Clock, DollarSign, X
} from 'lucide-react'

const Jobs = () => {
    
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)

    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        jobType: '',
        location: '',
        industry: '',
        category: '',
        workplaceType: ''
    })

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
    const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Sales', 'Design', 'Engineering', 'Human Resources', 'Operations', 'Other']
    const categories = ['Software Development', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Operations', 'Finance', 'Human Resources', 'Other']
    const workplaceTypes = ['On-site', 'Remote', 'Hybrid']

    useEffect(() => {
        loadJobs()
    }, [filters])

    const loadJobs = async () => {
        setLoading(true)
        try {
            // Build query string
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value)
            })

            const { data } = await api.get(`/api/jobs?${params.toString()}`)
            setJobs(data.jobs)
        } catch (error) {
            console.error('Load jobs error:', error)
        }
        setLoading(false)
    }

    const handleSaveJob = async (jobId) => {
        if (!token) {
            toast.error('Please login to save jobs')
            return
        }

        try {
            const { data } = await api.post(`/api/jobs/save/${jobId}`, {}, {
                headers: { Authorization: token }
            })
            toast.success(data.message)
            
            // Update UI
            setJobs(jobs.map(job =>
                job._id === jobId
                    ? { ...job, savedBy: data.isSaved ? [...job.savedBy, 'current-user'] : job.savedBy.filter(id => id !== 'current-user') }
                    : job
            ))
        } catch (error) {
            toast.error('Failed to save job')
        }
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            jobType: '',
            location: '',
            industry: '',
            category: '',
            workplaceType: ''
        })
    }

    const activeFiltersCount = Object.values(filters).filter(v => v).length

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>
                        {t('findDreamJob')}
                    </h1>
                    <p className='text-slate-600 dark:text-slate-400'>
                        {jobs.length} {t('jobsAvailable')}
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className='bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6'>
                    <div className='flex gap-4'>
                        {/* Search */}
                        <div className='flex-1 relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400' />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder={t('searchJobs')}
                                className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 relative'
                        >
                            <Filter className='size-5' />
                            {t('filters')}
                            {activeFiltersCount > 0 && (
                                <span className='absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center'>
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filters Dropdown */}
                    {showFilters && (
                        <div className='mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid md:grid-cols-3 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>{t('jobType')}</label>
                                <select
                                    value={filters.jobType}
                                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                                    className='w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value=''>{t('allTypes')}</option>
                                    {jobTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>{t('locationLabel')}</label>
                                <input
                                    type="text"
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    placeholder='e.g., Dhaka, Remote'
                                    className='w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>{t('industry')}</label>
                                <select
                                    value={filters.industry}
                                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                                    className='w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value=''>{t('allIndustries')}</option>
                                    {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>{t('category')}</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className='w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value=''>All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>Workplace</label>
                                <select
                                    value={filters.workplaceType}
                                    onChange={(e) => setFilters({ ...filters, workplaceType: e.target.value })}
                                    className='w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value=''>All</option>
                                    {workplaceTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {activeFiltersCount > 0 && (
                                <div className='flex items-end'>
                                    <button
                                        onClick={clearFilters}
                                        className='w-full px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium flex items-center justify-center gap-2'
                                    >
                                        <X className='size-4' />
                                        {t('clearFilters')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Job Listings */}
                {loading ? (
                    <div className='text-center py-12'>
                        <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto'></div>
                        <p className='mt-4 text-slate-600 dark:text-slate-400'>Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <Briefcase className='size-16 mx-auto mb-4 text-slate-300 dark:text-slate-600' />
                        <p className='text-lg text-slate-600 dark:text-slate-400'>{t('noJobsFound')}</p>
                        <button
                            onClick={clearFilters}
                            className='mt-4 text-indigo-600 dark:text-indigo-400 hover:underline'
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {jobs.map(job => (
                            <div
                                key={job._id}
                                className='bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow cursor-pointer'
                                onClick={() => navigate(`/app/jobs/${job._id}`)}
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex gap-4 flex-1'>
                                        {/* Company Logo */}
                                        <div className='size-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                                            {job.companyLogo ? (
                                                <img src={job.companyLogo} alt={job.company} className='size-12 object-contain' />
                                            ) : (
                                                <Building2 className='size-8 text-indigo-600 dark:text-indigo-400' />
                                            )}
                                        </div>

                                        {/* Job Info */}
                                        <div className='flex-1'>
                                            <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-1'>
                                                {job.title}
                                            </h3>
                                            <p className='text-slate-600 dark:text-slate-400 mb-3'>{job.company}</p>

                                            {/* Tags */}
                                            <div className='flex flex-wrap gap-2 mb-3'>
                                                <span className='px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium'>
                                                    {job.jobType}
                                                </span>
                                                <span className='px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1'>
                                                    <MapPin className='size-3' />
                                                    {job.location}
                                                </span>
                                                <span className='px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium'>
                                                    {job.workplaceType}
                                                </span>
                                                {job.salaryMin && (
                                                    <span className='px-3 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-1'>
                                                        <DollarSign className='size-3' />
                                                        {job.salaryMin.toLocaleString()}-{job.salaryMax?.toLocaleString()} {job.salaryCurrency}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Meta */}
                                            <div className='flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400'>
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='size-4' />
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                                <span>• {job.views} views</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSaveJob(job._id)
                                        }}
                                        className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                                    >
                                        {job.savedBy?.includes('current-user') ? (
                                            <BookmarkCheck className='size-6 text-indigo-600 dark:text-indigo-400' />
                                        ) : (
                                            <Bookmark className='size-6 text-slate-400 dark:text-slate-500' />
                                        )}
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

export default Jobs