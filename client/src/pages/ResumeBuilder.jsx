import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
    ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, 
    EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, 
    Sparkles, User, Save, Loader2
} from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'

const ResumeBuilder = () => {
    const { resumeId } = useParams()
    const { token } = useSelector(state => state.auth)

    const [resumeData, setResumeData] = useState({
        _id: '',
        title: '',
        personal_info: {},
        professional_summary: "",
        experience: [],
        education: [],
        project: [],
        skills: [],
        template: 'classic',
        accent_color: '#3B82F6',
        public: false,
        sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills']
    })

    const [activeSectionIndex, setActiveSectionIndex] = useState(0)
    const [removeBackground, setRemoveBackground] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const sections = [
        { id: 'personal', name: 'Personal Info', icon: User },
        { id: 'summary', name: 'Summary', icon: FileText },
        { id: 'experience', name: 'Experience', icon: Briefcase },
        { id: 'education', name: 'Education', icon: GraduationCap },
        { id: 'projects', name: 'Projects', icon: FolderIcon },
        { id: 'skills', name: 'Skills', icon: Sparkles },
    ]

    const activeSection = sections[activeSectionIndex]

    const loadExistingResume = async () => {
        try {
            const { data } = await api.get('/api/resumes/get/' + resumeId, {
                headers: { Authorization: token },
            })

            if (data.resume) {
                const normalizedResume = {
                    ...data.resume,
                    experience: data.resume.experience || [],
                    education: data.resume.education || [],
                    project: data.resume.project || [],
                    skills: data.resume.skills || [],
                    personal_info: data.resume.personal_info || {},
                    professional_summary: data.resume.professional_summary || "",
                    template: data.resume.template || 'classic',
                    accent_color: data.resume.accent_color || '#3B82F6',
                    public: data.resume.public || false,
                    sectionOrder: data.resume.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills']
                }

                setResumeData(normalizedResume)
                document.title = normalizedResume.title || "Untitled Resume"
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Failed to load resume")
        }
    }

    useEffect(() => {
        loadExistingResume()
    }, [])

    const saveResume = async () => {
        setIsSaving(true)
        try {
            let updatedResumeData = structuredClone(resumeData)
            
            if (typeof resumeData.personal_info.image === 'object') {
                delete updatedResumeData.personal_info.image
            }

            const formData = new FormData()
            formData.append("resumeId", resumeId)
            formData.append("resumeData", JSON.stringify(updatedResumeData))
            
            if (removeBackground) {
                formData.append('removeBackground', 'yes')
            }
            
            if (typeof resumeData.personal_info.image === 'object') {
                formData.append("image", resumeData.personal_info.image)
            }

            const { data } = await api.put('/api/resumes/update', formData, {
                headers: { Authorization: token }
            })

            setResumeData(prev => ({ ...prev, ...data.resume }))
            toast.success('Saved successfully!')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save resume')
        }
        setIsSaving(false)
    }

    const changeResumeVisibility = async () => {
        try {
            const formData = new FormData()
            formData.append("resumeId", resumeId)
            formData.append("resumeData", JSON.stringify({ public: !resumeData.public }))
            const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })

            setResumeData({ ...resumeData, public: !resumeData.public })
            toast.success(data.message)
        } catch (error) {
            console.error('Error changing visibility:', error)
        }
    }

    const handleShare = () => {
        const frontendUrl = window.location.href.split('/app/')[0]
        const resumeUrl = frontendUrl + '/view/' + resumeId

        if (navigator.share) {
            navigator.share({ url: resumeUrl, text: "My Resume" })
        } else {
            alert('Share Not Supported On this Browser')
        }
    }

    const downloadResume = () => {
        window.print()
    }

    const handleSectionOrderChange = async (newOrder) => {
        setResumeData(prev => ({ ...prev, sectionOrder: newOrder }))
        try {
            await api.put('/api/resumes/update-order', {
                resumeId,
                sectionOrder: newOrder
            }, {
                headers: { Authorization: token }
            })
            toast.success('Section order updated!')
        } catch (error) {
            console.error('Error updating section order:', error)
            toast.error('Failed to update section order')
        }
    }

    return (
        <div className='bg-white min-h-screen'>
            <div className='max-w-7xl mx-auto px-4 py-6'>
                <div className='flex items-center justify-between'>
                    <Link to='/app/my-resumes' className='inline-flex gap-2 items-center text-slate-600 hover:text-slate-800 transition-all'>
                        <ArrowLeftIcon className='size-4' />
                        Back To My Resumes
                    </Link>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 pb-8'>
                <div className='grid lg:grid-cols-12 gap-8'>

                    {/* Left Side */}
                    <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
                            {/* Progress bar */}
                            <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200' />
                            <hr 
                                className='absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-500 border-none transition-all duration-300' 
                                style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }} 
                            />

                            {/* Navigation */}
                            <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1'>
                                <div className='flex items-center gap-2'>
                                    <TemplateSelector 
                                        selectedTemplate={resumeData.template} 
                                        onChange={(template) => setResumeData(prev => ({ ...prev, template }))} 
                                    />
                                </div>

                                <ColorPicker 
                                    selectedColor={resumeData.accent_color} 
                                    onChange={(color) => setResumeData(prev => ({ ...prev, accent_color: color }))} 
                                />

                                <div className='flex items-center'>
                                    {activeSectionIndex !== 0 && (
                                        <button 
                                            onClick={() => setActiveSectionIndex(prev => Math.max(prev - 1, 0))} 
                                            className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all'
                                        >
                                            <ChevronLeft className='size-4' /> Previous
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => setActiveSectionIndex(prev => Math.min(prev + 1, sections.length - 1))} 
                                        className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50 cursor-not-allowed'}`} 
                                        disabled={activeSectionIndex === sections.length - 1}
                                    >
                                        Next <ChevronRight className='size-4' />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <div className='space-y-6'>
                                {activeSection.id === 'personal' && (
                                    <PersonalInfoForm 
                                        data={resumeData.personal_info} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))} 
                                        removeBackground={removeBackground} 
                                        setRemoveBackground={setRemoveBackground} 
                                    />
                                )}

                                {activeSection.id === 'summary' && (
                                    <ProfessionalSummaryForm 
                                        data={resumeData.professional_summary} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))} 
                                        setResumeData={setResumeData} 
                                    />
                                )}

                                {activeSection.id === 'experience' && (
                                    <ExperienceForm 
                                        data={resumeData.experience} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))} 
                                    />
                                )}

                                {activeSection.id === 'education' && (
                                    <EducationForm 
                                        data={resumeData.education} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))} 
                                    />
                                )}

                                {activeSection.id === 'projects' && (
                                    <ProjectForm 
                                        data={resumeData.project} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))} 
                                    />
                                )}

                                {activeSection.id === 'skills' && (
                                    <SkillsForm 
                                        data={resumeData.skills} 
                                        onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))} 
                                    />
                                )}
                            </div>

                            {/* Manual Save Button */}
                            <div className='mt-6'>
                                <button 
                                    onClick={saveResume}
                                    disabled={isSaving}
                                    className='w-full bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all rounded-lg px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md'
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className='size-4 animate-spin' />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className='size-4' />
                                            Save Resume
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Preview with more padding for drag handles */}
                    <div className='lg:col-span-7 max-lg:mt-6'>
                        <div className='relative w-full mb-4'>
                            <div className='flex items-center justify-end gap-2'>
                                {resumeData.public && (
                                    <button 
                                        onClick={handleShare} 
                                        className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'
                                    >
                                        <Share2Icon className='size-4' /> Share
                                    </button>
                                )}

                                <button 
                                    onClick={changeResumeVisibility} 
                                    className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'
                                >
                                    {resumeData.public ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                                    {resumeData.public ? 'Public' : 'Private'}
                                </button>

                                <button 
                                    onClick={downloadResume} 
                                    className='flex items-center py-2 px-6 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'
                                >
                                    <DownloadIcon className='size-4' /> Download
                                </button>
                            </div>
                        </div>

                        {/* Resume Preview with extra left padding for drag handles */}
                        <div className='pl-10'>
                            <ResumePreview 
                                data={resumeData} 
                                template={resumeData.template} 
                                accentColor={resumeData.accent_color}
                                sectionOrder={resumeData.sectionOrder}
                                onSectionOrderChange={handleSectionOrderChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResumeBuilder