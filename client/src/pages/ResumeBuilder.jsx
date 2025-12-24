import React, { useEffect, useState} from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, User, Linkedin } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

const ResumeBuilder = () => {
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const {resumeId} = useParams()

  const [resumeData,setResumeData] = useState({
    _id:'',
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
  })

  const loadExistingResume = async () => {
    const resume = dummyResumeData.find(resume => resume._id === resumeId)
    if (resume){
      setResumeData(resume)
      document.title = resume.title
    }
  }

  const [activeSectionIndex,setActiveSectionIndex] = useState(0)
  const [removeBackground,setRemoveBackground] = useState(false)
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [linkedInText, setLinkedInText] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const sections = [
    {id: 'personal', name: t('personalInfo'), icon: User},
    {id: 'summary', name: t('summary'), icon: FileText},
    {id: 'experience', name: t('experience'), icon: Briefcase},
    {id: 'education', name: t('education'), icon: GraduationCap},
    {id: 'projects', name: t('projects'), icon: FolderIcon},
    {id: 'skills', name: t('skills'), icon: Sparkles},
  ]

  const activeSection = sections[activeSectionIndex]

  useEffect(()=>{
    loadExistingResume()
  },[])

  const changeResumeVisibility = async () => {
    setResumeData({...resumeData, public: !resumeData.public})
  }

  const handleShare = () =>{
    const frontendUrl = window.location.href.split('/app/')[0]
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if(navigator.share){
      navigator.share({url: resumeUrl, text: "My Resume", })
    }else{
      alert('Share Not Supported On this Browser')
    }
  }

  const downloadResume = () =>{
    window.print();
  }

  const importFromLinkedIn = async () => {
    if (!linkedInText.trim()) {
      toast.error(t('pasteProfileContent'))
      return
    }

    setIsImporting(true)
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.post(
        '/api/ai/import-linkedin',
        { profileText: linkedInText },
        { headers: { Authorization: `Bearer ${token}` } }
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
      toast.success(t('linkedInImportSuccess'))
    } catch (error) {
      console.error('Import error:', error)
      toast.error(
        error.response?.data?.message || 
        t('linkedInImportError')
      )
    } finally {
      setIsImporting(false)
    }
  }


  return (
    <div>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <Link to = {'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
            <ArrowLeftIcon className='size-4'/>{t('backToDashboard')}
          </Link>
        </div>

        <div className='max-w-7xl mx-auto px-4 pb-8'>
          <div className='grid lg:grid-cols-12 gap-8'>

            {/* Left Side */}
            <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
                {/* Progress bar */}
                <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200'/>
                <hr className='absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-500 border-none transition-all duration-2000' style={{width:`${activeSectionIndex*100 / (sections.length-1)}%`}}/>

                {/* Navigation */}
                <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1'>

                  <div className='flex  items-center gap-2'>
                    <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev,template}))}/>
                    <button 
                      onClick={() => setShowLinkedInModal(true)} 
                      className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-colors'
                      title={t('importFromLinkedIn')}
                    >
                      <Linkedin size={14} />
                      {t('import')}
                    </button>
                  </div>

                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=> setResumeData(prev => ({...prev,accent_color:color}))}/>

                  <div className='flex items-center'>
                    {activeSectionIndex!==0 && (
                      <button onClick={()=>setActiveSectionIndex((prevIndex)=>Math.max(prevIndex-1,0))} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex===0}>
                        <ChevronLeft className='size-4'/> {t('previous')}
                      </button>
                    )}


                    <button onClick={()=>setActiveSectionIndex((prevIndex)=>Math.min(prevIndex+1,sections.length-1))} className= {`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex===sections.length - 1}>
                        {t('next')} <ChevronRight className='size-4'/> 
                    </button>
                  </div>
                </div>
                {/* Form */}
                <div className='space-y-6'>
                  {activeSection.id === 'personal' && (
                      <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=>setResumeData(prev => ({...prev,personal_info:data}))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground}/>
                    )
                  }

                  {activeSection.id === 'summary' &&(
                      <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data)=>setResumeData(prev=>({...prev,professional_summary:data}))} setResumeData={setResumeData}/>
                    )
                  }

                  {activeSection.id === 'experience' &&(
                      <ExperienceForm data={resumeData.experience} onChange={(data)=>setResumeData(prev=>({...prev,experience:data}))}/>
                    )
                  }

                  {activeSection.id === 'education' &&(
                      <EducationForm data={resumeData.education} onChange={(data)=>setResumeData(prev=>({...prev,education:data}))}/>
                    )
                  }

                  {activeSection.id === 'projects' &&(
                      <ProjectForm data={resumeData.project} onChange={(data)=>setResumeData(prev=>({...prev,project:data}))}/>
                    )
                  }

                  {activeSection.id === 'skills' &&(
                      <SkillsForm data={resumeData.skills} onChange={(data)=>setResumeData(prev=>({...prev,skills:data}))}/>
                    )
                  }
                </div>

                <div>
                  <button className='bg-gradient-to-br from-green-100 tp-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 ,t-6 text-sm mt-5'>{t('saveChanges')}</button>
                </div>
              </div>
            </div>


            {/* Right Side */}
            <div className='lg:col-span-7 max-lg:mt-6'>
              <div className='relative w-full'>
                <div className='absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2'>
                  {resumeData.public && (
                    <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                      <Share2Icon className='size-4'/> {t('share')}
                    </button>
                  )}

                  <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'>
                    {resumeData.public ? <EyeIcon className='size-4'/> : <EyeOffIcon className='size-4'/>}
                    {resumeData.public ? t('public') : t('private')}
                  </button>

                  <button onClick={downloadResume} className='flex items-center py-2 px-6 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'>
                    <DownloadIcon className='size-4'/> {t('download')}
                  </button>
                </div>
              </div>

              {/* Resume See */}
              <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color}/>
            </div>
          </div>
        </div>

        {/* LinkedIn Import Modal */}
        {showLinkedInModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl'>
              <div className='flex items-center gap-2 mb-4'>
                <Linkedin className='text-blue-600' size={24} />
                <h3 className='text-xl font-semibold'>{t('importFromLinkedIn')}</h3>
              </div>
              <p className='text-sm text-gray-600 mb-3'>
                {t('copyProfileInstructions')}
              </p>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800'>
                <strong>📋 {t('howToCopyProfile')}</strong>
                <ol className='ml-4 mt-1 space-y-1'>
                  <li>1. {t('goToLinkedIn')}</li>
                  <li>2. {t('selectAll')} <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Ctrl+A</kbd> (or <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Cmd+A</kbd>)</li>
                  <li>3. {t('copy')} <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Ctrl+C</kbd> (or <kbd className='px-1.5 py-0.5 bg-white border border-blue-300 rounded'>Cmd+C</kbd>)</li>
                  <li>4. {t('pasteBelow')}</li>
                </ol>
              </div>
              <textarea
                placeholder={t('pasteProfileContent')}
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
                      {t('importing')}
                    </>
                  ) : (
                    t('import')
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
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}

export default ResumeBuilder