import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { Briefcase, ArrowLeft, Save } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

const CreateJob = () => {
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
        responsibilities: '',
        benefits: '',
        jobType: 'Full-time',
        location: '',
        workplaceType: 'On-site',
        industry: 'Technology',
        category: 'Software Development',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'BDT',
        salaryPeriod: 'Monthly',
        experienceMin: 0,
        experienceMax: '',
        educationLevel: 'Bachelor',
        applicationEmail: '',
        applicationUrl: '',
        applicationDeadline: '',
        skills: ''
    })

    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const jobData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            }

            const { data } = await api.post('/api/jobs/create', jobData, {
                headers: { Authorization: token }
            })

            toast.success(t('jobPostedSuccess'))
            navigate(`/app/jobs/${data.job._id}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || t('jobPostError'))
        }
        setLoading(false)
    }

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
    const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Sales', 'Design', 'Engineering', 'Human Resources', 'Operations', 'Other']
    const categories = ['Software Development', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Operations', 'Finance', 'Human Resources', 'Other']
    const workplaceTypes = ['On-site', 'Remote', 'Hybrid']
    const educationLevels = ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Any']

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <button
                    onClick={() => navigate('/app/jobs')}
                    className='flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6'
                >
                    <ArrowLeft className='size-5' />
                    {t('backToJobs')}
                </button>

                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl'>
                            <Briefcase className='size-8 text-indigo-600 dark:text-indigo-400' />
                        </div>
                        <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                            {t('postJob')}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Basic Info */}
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('jobTitle')} *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder='e.g., Senior Software Engineer'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('company')} *
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder='e.g., Tech Corp'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                    required
                                />
                            </div>
                        </div>

                        {/* Job Type & Location */}
                        <div className='grid md:grid-cols-3 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('jobType')} *
                                </label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('locationLabel')} *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder='e.g., Dhaka, Bangladesh'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('workplace')} *
                                </label>
                                <select
                                    name="workplaceType"
                                    value={formData.workplaceType}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    {workplaceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Industry & Category */}
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('industry')} *
                                </label>
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('category')} *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('jobDescription')} *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder='Describe the role, company, and what makes this opportunity great...'
                                rows={6}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                                required
                            />
                        </div>

                        {/* Requirements */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('requirements')} *
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder='List the required qualifications, skills, and experience...'
                                rows={4}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                                required
                            />
                        </div>

                        {/* Responsibilities */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('responsibilities')}
                            </label>
                            <textarea
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                placeholder='What will the person be doing day-to-day?'
                                rows={4}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                            />
                        </div>

                        {/* Benefits */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('benefits')}
                            </label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                                placeholder='Health insurance, flexible hours, etc...'
                                rows={3}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                            />
                        </div>

                        {/* Salary */}
                        <div className='grid md:grid-cols-4 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('minSalary')}
                                </label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('maxSalary')}
                                </label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('currency')}
                                </label>
                                <select
                                    name="salaryCurrency"
                                    value={formData.salaryCurrency}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value="BDT">BDT</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('period')}
                                </label>
                                <select
                                    name="salaryPeriod"
                                    value={formData.salaryPeriod}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    <option value="Hourly">{t('hourly')}</option>
                                    <option value="Monthly">{t('monthly')}</option>
                                    <option value="Yearly">{t('yearly')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Experience & Education */}
                        <div className='grid md:grid-cols-3 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('minExperience')}
                                </label>
                                <input
                                    type="number"
                                    name="experienceMin"
                                    value={formData.experienceMin}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('maxExperience')}
                                </label>
                                <input
                                    type="number"
                                    name="experienceMax"
                                    value={formData.experienceMax}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('educationLabel')}
                                </label>
                                <select
                                    name="educationLevel"
                                    value={formData.educationLevel}
                                    onChange={handleChange}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                >
                                    {educationLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('requiredSkills')}
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder='e.g., React, Node.js, Python, SQL'
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                            />
                        </div>

                        {/* Application */}
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('applicationEmail')}
                                </label>
                                <input
                                    type="email"
                                    name="applicationEmail"
                                    value={formData.applicationEmail}
                                    onChange={handleChange}
                                    placeholder='careers@company.com'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('applicationURL')}
                                </label>
                                <input
                                    type="url"
                                    name="applicationUrl"
                                    value={formData.applicationUrl}
                                    onChange={handleChange}
                                    placeholder='https://company.com/careers'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                />
                            </div>
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                {t('deadline')}
                            </label>
                            <input
                                type="date"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                            />
                        </div>

                        {/* Submit */}
                        <div className='flex gap-4 pt-6'>
                            <button
                                type='button'
                                onClick={() => navigate('/app/jobs')}
                                className='flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors'
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type='submit'
                                disabled={loading}
                                className='flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2'
                            >
                                {loading ? (
                                    <>
                                        <div className='animate-spin size-5 border-2 border-white border-t-transparent rounded-full'></div>
                                        {t('posting')}
                                    </>
                                ) : (
                                    <>
                                        <Save className='size-5' />
                                        {t('postJobButton')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateJob