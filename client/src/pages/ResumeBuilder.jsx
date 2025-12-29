import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon,
    EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon,
    Sparkles, User, Save, Loader2, Linkedin
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
    const [showLinkedInModal, setShowLinkedInModal] = useState(false)
    const [linkedInText, setLinkedInText] = useState('')
    const [isImporting, setIsImporting] = useState(false)

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
            console.error("Error loading resume:", error)
            if (error.response?.status === 404) {
                toast.error("Resume not found. Please check the URL or create a new resume.")
            } else {
                toast.error("Failed to load resume. Please try again.")
            }
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

    const [showDownloadMenu, setShowDownloadMenu] = useState(false)

    const downloadAsPdf = () => {
        window.print()
        setShowDownloadMenu(false)
    }

    const downloadAsTxt = () => {
        const { personal_info, professional_summary, experience, education, project, skills, sectionOrder } = resumeData;
        let content = '';

        // Header
        content += `${personal_info.full_name || ''}\n`;
        content += `${personal_info.email || ''} | ${personal_info.phone || ''}\n`;
        if (personal_info.location) content += `${personal_info.location}\n`;
        if (personal_info.linkedin) content += `${personal_info.linkedin}\n`;
        content += '\n' + '='.repeat(20) + '\n\n';

        // Helper to get section content
        const getSectionContent = (id) => {
            let sectionText = '';
            switch (id) {
                case 'summary':
                    if (professional_summary) {
                        sectionText += `PROFESSIONAL SUMMARY\n${'-'.repeat(20)}\n`;
                        // Strip HTML tags for text format
                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = professional_summary;
                        sectionText += `${tempDiv.textContent || tempDiv.innerText || ''}\n\n`;
                    }
                    break;
                case 'experience':
                    if (experience.length > 0) {
                        sectionText += `EXPERIENCE\n${'-'.repeat(20)}\n`;
                        experience.forEach(exp => {
                            sectionText += `${exp.position} | ${exp.company}\n`;
                            sectionText += `${exp.start_date} - ${exp.end_date || 'Present'}\n`;
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = exp.description;
                            sectionText += `${tempDiv.textContent || tempDiv.innerText || ''}\n\n`;
                        });
                    }
                    break;
                case 'education':
                    if (education.length > 0) {
                        sectionText += `EDUCATION\n${'-'.repeat(20)}\n`;
                        education.forEach(edu => {
                            sectionText += `${edu.school}\n`;
                            sectionText += `${edu.degree}, ${edu.field_of_study}\n`;
                            sectionText += `${edu.start_date} - ${edu.end_date || 'Present'}\n\n`;
                        });
                    }
                    break;
                case 'projects':
                    if (project.length > 0) {
                        sectionText += `PROJECTS\n${'-'.repeat(20)}\n`;
                        project.forEach(proj => {
                            sectionText += `${proj.name}\n`;
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = proj.description;
                            sectionText += `${tempDiv.textContent || tempDiv.innerText || ''}\n\n`;
                        });
                    }
                    break;
                case 'skills':
                    if (skills.length > 0) {
                        sectionText += `SKILLS\n${'-'.repeat(20)}\n`;
                        skills.forEach(skill => {
                            sectionText += `${skill.name} (${skill.level})\n`;
                        });
                        sectionText += '\n';
                    }
                    break;
                default:
                    break;
            }
            return sectionText;
        };

        // Loop through section order
        sectionOrder.forEach(sectionId => {
            content += getSectionContent(sectionId);
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.title || 'resume'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadMenu(false);
    }

    const downloadAsDoc = () => {
        const { personal_info, professional_summary, experience, education, project, skills, sectionOrder } = resumeData;

        // Basic Styles
        let htmlBody = `<h1 style="text-align: center;">${personal_info.full_name || ''}</h1>`;
        htmlBody += `<p style="text-align: center;">
            ${personal_info.email || ''} | ${personal_info.phone || ''} <br/>
            ${personal_info.location || ''} <br/>
            ${personal_info.linkedin || ''}
        </p><hr/>`;

        const getSectionHtml = (id) => {
            let html = '';
            switch (id) {
                case 'summary':
                    if (professional_summary) {
                        html += `<h3>PROFESSIONAL SUMMARY</h3>`;
                        html += `<div>${professional_summary}</div>`;
                    }
                    break;
                case 'experience':
                    if (experience.length > 0) {
                        html += `<h3>EXPERIENCE</h3>`;
                        experience.forEach(exp => {
                            html += `<p><strong>${exp.position}</strong> at <strong>${exp.company}</strong><br/>`;
                            html += `<em>${exp.start_date} - ${exp.end_date || 'Present'}</em></p>`;
                            html += `<div>${exp.description}</div>`;
                        });
                    }
                    break;
                case 'education':
                    if (education.length > 0) {
                        html += `<h3>EDUCATION</h3>`;
                        education.forEach(edu => {
                            html += `<p><strong>${edu.school}</strong><br/>`;
                            html += `${edu.degree}, ${edu.field_of_study}<br/>`;
                            html += `<em>${edu.start_date} - ${edu.end_date || 'Present'}</em></p>`;
                        });
                    }
                    break;
                case 'projects':
                    if (project.length > 0) {
                        html += `<h3>PROJECTS</h3>`;
                        project.forEach(proj => {
                            html += `<p><strong>${proj.name}</strong></p>`;
                            html += `<div>${proj.description}</div>`;
                        });
                    }
                    break;
                case 'skills':
                    if (skills.length > 0) {
                        html += `<h3>SKILLS</h3>`;
                        html += `<ul>`;
                        skills.forEach(skill => {
                            html += `<li>${skill.name} - ${skill.level}</li>`;
                        });
                        html += `</ul>`;
                    }
                    break;
                default:
                    break;
            }
            return html;
        };

        sectionOrder.forEach(sectionId => {
            htmlBody += getSectionHtml(sectionId);
        });

        const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${resumeData.title}</title>
        <style>body { font-family: Arial, sans-serif; }</style>
        </head><body>`;
        const postHtml = "</body></html>";
        const content = preHtml + htmlBody + postHtml;

        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.title || 'resume'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadMenu(false);
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

    const importFromLinkedIn = async () => {
        if (!linkedInText.trim()) {
            toast.error('Please paste your LinkedIn profile content')
            return
        }

        setIsImporting(true)
        try {
            const { data } = await api.post(
                '/api/ai/import-linkedin',
                { profileText: linkedInText },
                { headers: { Authorization: token } }
            )

            // Merge imported data with existing resume data
            setResumeData(prev => ({
                ...prev,
                professional_summary: data.resumeData.professional_summary || prev.professional_summary,
                personal_info: {
                    ...prev.personal_info,
                    ...data.resumeData.personal_info,
                    full_name: data.resumeData.personal_info?.full_name || prev.personal_info.full_name,
                    profession: data.resumeData.personal_info?.profession || prev.personal_info.profession,
                    location: data.resumeData.personal_info?.location || prev.personal_info.location,
                    linkedin: data.resumeData.personal_info?.linkedin || prev.personal_info.linkedin,
                },
                experience: [...(data.resumeData.experience || []), ...(prev.experience || [])],
                education: [...(data.resumeData.education || []), ...(prev.education || [])],
                project: [...(data.resumeData.project || []), ...(prev.project || [])],
                skills: [...new Set([...(data.resumeData.skills || []), ...(prev.skills || [])])],
            }))

            setShowLinkedInModal(false)
            setLinkedInText('')
            toast.success('LinkedIn profile imported successfully!')
        } catch (error) {
            console.error('Import error:', error)
            toast.error(
                error.response?.data?.message ||
                'Failed to import LinkedIn profile. Please try again.'
            )
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className='bg-white min-h-screen'>
            <div className='max-w-7xl mx-auto px-4 py-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Link to='/app/my-resumes' className='inline-flex gap-2 items-center text-slate-600 hover:text-slate-800 transition-all'>
                            <ArrowLeftIcon className='size-4' />
                            Back To My Resumes
                        </Link>
                    </div>
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
                                    <button
                                        onClick={() => setShowLinkedInModal(true)}
                                        className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors'
                                        title='Import from LinkedIn'
                                    >
                                        <Linkedin size={14} />
                                        Import
                                    </button>
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

                                <div className='relative'>
                                    <button
                                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                        className='flex items-center py-2 px-6 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'
                                    >
                                        <DownloadIcon className='size-4' /> Download
                                    </button>

                                    {showDownloadMenu && (
                                        <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200'>
                                            <button
                                                onClick={downloadAsPdf}
                                                className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left'
                                            >
                                                <div className="p-1.5 bg-red-100 text-red-600 rounded-md">
                                                    <FileText className="size-4" />
                                                </div>
                                                PDF Document
                                            </button>
                                            <button
                                                onClick={downloadAsTxt}
                                                className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left'
                                            >
                                                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md">
                                                    <FileText className="size-4" />
                                                </div>
                                                Text File (.txt)
                                            </button>
                                            <button
                                                onClick={downloadAsDoc}
                                                className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left'
                                            >
                                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                                    <FileText className="size-4" />
                                                </div>
                                                Word Document
                                            </button>
                                        </div>
                                    )}
                                </div>
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

            {/* LinkedIn Import Modal */}
            {showLinkedInModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Linkedin className='text-blue-600' size={24} />
                            <h3 className='text-xl font-semibold'>Import from LinkedIn</h3>
                        </div>
                        <p className='text-sm text-gray-600 mb-3'>
                            Copy your entire LinkedIn profile page and paste it below to automatically import your information.
                        </p>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800'>
                            <strong>📋 How to copy your profile:</strong>
                            <ol className='ml-4 mt-1 space-y-1'>
                                <li>1. Go to your LinkedIn profile page</li>
                                <li>2. Select all content <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Ctrl+A</kbd> (or <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Cmd+A</kbd> on Mac)</li>
                                <li>3. Copy <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Ctrl+C</kbd> (or <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Cmd+C</kbd> on Mac)</li>
                                <li>4. Paste it in the box below</li>
                            </ol>
                        </div>
                        <textarea
                            placeholder='Paste your LinkedIn profile content here...'
                            value={linkedInText}
                            onChange={(e) => setLinkedInText(e.target.value)}
                            className='w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
                            rows={10}
                            disabled={isImporting}
                        />
                        <div className='flex gap-3'>
                            <button
                                onClick={importFromLinkedIn}
                                disabled={isImporting}
                                className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
                            >
                                {isImporting ? (
                                    <>
                                        <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                        </svg>
                                        Importing...
                                    </>
                                ) : (
                                    'Import'
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowLinkedInModal(false)
                                    setLinkedInText('')
                                }}
                                disabled={isImporting}
                                className='flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResumeBuilder