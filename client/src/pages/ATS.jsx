import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import { 
    FileSearch, Sparkles, CheckCircle2, XCircle, Loader2, 
    Target, ArrowRight, Award, BarChart3, FileText, Lightbulb, TrendingUp, Download
} from 'lucide-react'


const ATS = () => {
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)
    const { token } = useSelector(state => state.auth)
    const reportRef = useRef(null)
    const resumeFileInputRef = useRef(null)

    const [resumeFile, setResumeFile] = useState(null)
    const [resumeText, setResumeText] = useState('')
    const [uploadedResumeId, setUploadedResumeId] = useState(null)
    const [jobDescription, setJobDescription] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [company, setCompany] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [isDraggingResume, setIsDraggingResume] = useState(false)

    const handleResumeFileSelect = async (file) => {
        if (!file) return
        
        setResumeFile(file)
        setIsUploading(true)
        
        try {
            // Extract text from PDF
            const text = await pdfToText(file)
            setResumeText(text)
            
            // Upload resume to backend to create a temporary resume entry
            const { data } = await api.post('/api/ai/upload-resume', {
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
                resumeText: text
            }, {
                headers: { Authorization: token }
            })
            
            setUploadedResumeId(data.resumeId)
            toast.success('Resume uploaded successfully!')
        } catch (error) {
            console.error('Resume upload error:', error)
            toast.error('Failed to process resume')
            setResumeFile(null)
            setResumeText('')
        }
        
        setIsUploading(false)
    }

    const handleResumeDrop = (e) => {
        e.preventDefault()
        setIsDraggingResume(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === 'application/pdf') {
            handleResumeFileSelect(file)
        } else {
            toast.error('Please upload a PDF file')
        }
    }

    const handleAnalyze = async () => {
        if (!uploadedResumeId || !jobDescription.trim()) {
            toast.error('Please upload a resume and paste job description')
            return
        }

        setIsAnalyzing(true)
        
        try {
            // Call real backend API for analysis
            const { data } = await api.post('/api/ai/analyze-job-match', {
                resumeId: uploadedResumeId,
                jobDescription,
                jobTitle,
                company
            }, {
                headers: { Authorization: token }
            })
            
            setAnalysis(data)
            toast.success('Analysis complete!')
            
            setTimeout(() => {
                reportRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 300)
        } catch (error) {
            console.error('Analysis error:', error)
            toast.error(error?.response?.data?.message || 'Analysis failed')
        }
        
        setIsAnalyzing(false)
    }

    const handleDownloadReport = () => {
        if (!analysis) return

        const report = `
ATS RESUME ANALYSIS REPORT
=========================

Job Title: ${analysis.jobTitle || 'N/A'}
Company: ${analysis.company || 'N/A'}
Analyzed: ${new Date(analysis.analyzedAt).toLocaleDateString()}

OVERALL SCORE
-------------
ATS Score: ${analysis.atsScore}/100
Match Rate: ${analysis.matchRate}%

SKILLS ANALYSIS
--------------
Hard Skills Score: ${analysis.hardSkillsScore}/100
Soft Skills Score: ${analysis.softSkillsScore}/100

MATCHED KEYWORDS (${analysis.matchedKeywords.length})
${analysis.matchedKeywords.map(k => `✓ ${k}`).join('\n')}

MISSING KEYWORDS (${analysis.missingKeywords.length})
${analysis.missingKeywords.map(k => `✗ ${k}`).join('\n')}

SECTION SCORES
--------------
Summary: ${analysis.sectionScores.summary}/100
Skills: ${analysis.sectionScores.skills}/100
Experience: ${analysis.sectionScores.experience}/100
Education: ${analysis.sectionScores.education}/100

AI SUGGESTIONS
--------------
${analysis.suggestions.improvedSummary ? `Improved Summary:\n${analysis.suggestions.improvedSummary}\n\n` : ''}
${analysis.suggestions.skillsToAdd?.length > 0 ? `Skills to Add:\n${analysis.suggestions.skillsToAdd.map(s => `• ${s}`).join('\n')}\n\n` : ''}
${analysis.suggestions.overallTips?.length > 0 ? `Tips:\n${analysis.suggestions.overallTips.map(t => `• ${t}`).join('\n')}` : ''}

---
Generated by ATS Resume Analyzer
        `

        const blob = new Blob([report], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ATS_Report_${analysis.jobTitle || 'Analysis'}_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success('Report downloaded!')
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-green-500 to-green-600'
        if (score >= 60) return 'from-yellow-500 to-yellow-600'
        return 'from-red-500 to-red-600'
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900'>
            <div className='max-w-7xl mx-auto px-4 py-12'>
                
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center gap-3 mb-4'>
                        <div className='p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg'>
                            <FileSearch className='w-8 h-8 text-white' />
                        </div>
                    </div>
                    <h1 className='text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4'>
                    {t('atsResumeAnalyzer')}
                    </h1>
                    <p className='text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto'>
                        {t('atsDescription')}
                    </p>
                </div>

                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 mb-8'>
                    <div className='grid md:grid-cols-2 gap-6'>
                        
                        {/* Left Column - Resume Upload */}
                        <div className='space-y-6'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('uploadYourResume')} *
                                </label>
                                
                                <div 
                                    onDragOver={(e) => {e.preventDefault(); setIsDraggingResume(true)}}
                                    onDragLeave={() => setIsDraggingResume(false)} 
                                    onDrop={handleResumeDrop}
                                    className={`border-2 border-dashed rounded-xl transition-all ${
                                        isDraggingResume 
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                            : 'border-slate-300 dark:border-slate-700'
                                    }`}
                                >
                                    {!resumeFile ? (
                                        <div className='p-8 text-center'>
                                            <FileText className='w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500' />
                                            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-1'>
                                                {t('dragDrop')}{' '}
                                                <button 
                                                    onClick={() => resumeFileInputRef.current?.click()} 
                                                    className='text-indigo-600 dark:text-indigo-400 hover:underline'
                                                >
                                                    {t('chooseFileButton')}
                                                </button>
                                                {' '}{t('toUpload')}
                                            </p>
                                            <p className='text-xs text-slate-500 dark:text-slate-500'>{t('pdfFileOnly')}</p>
                                        </div>
                                    ) : isUploading ? (
                                        <div className='p-8 text-center'>
                                            <Loader2 className='w-12 h-12 mx-auto mb-3 text-indigo-600 animate-spin' />
                                            <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                                                {t('processingResume')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className='p-6'>
                                            <div className='flex items-center gap-3 mb-3'>
                                                <FileText className='w-10 h-10 text-green-600 dark:text-green-400' />
                                                <div className='flex-1'>
                                                    <p className='font-medium text-slate-900 dark:text-slate-100'>{resumeFile.name}</p>
                                                    <p className='text-sm text-slate-500 dark:text-slate-400'>
                                                        {(resumeFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <CheckCircle2 className='w-6 h-6 text-green-600 dark:text-green-400' />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setResumeFile(null)
                                                    setResumeText('')
                                                    setUploadedResumeId(null)
                                                }}
                                                className='text-sm text-red-600 dark:text-red-400 hover:underline'
                                            >
                                                {t('removeFile')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    ref={resumeFileInputRef} 
                                    type="file" 
                                    accept=".pdf" 
                                    hidden 
                                    onChange={(e) => handleResumeFileSelect(e.target.files[0])} 
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('jobTitleOptional')}
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder='e.g., Senior Full Stack Developer'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                    {t('companyOptional')}
                                </label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder='e.g., Google'
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all'
                                />
                            </div>
                        </div>

                        {/* Right Column - Job Description */}
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                                {t('pasteJobDescription')} *
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder='Paste the complete job description here...

Example:
We are looking for a Senior Full Stack Developer with 5+ years of experience...

Requirements:
- React, Node.js, TypeScript
- AWS, Docker, Kubernetes
- Bachelor degree in Computer Science'
                                rows={18}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 resize-none focus:border-indigo-500 transition-all'
                            />
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center'>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || isUploading || !uploadedResumeId || !jobDescription.trim()}
                            className='group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none transition-all disabled:cursor-not-allowed flex items-center gap-3'
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className='w-6 h-6 animate-spin' />
                                    {t('analyzingYourResume')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className='w-6 h-6' />
                                    {t('analyzeMatch')}
                                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {analysis && (
                    <div ref={reportRef} className='space-y-8'>
                        
                        <div className='flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-1'>{t('analysisResults')}</h2>
                                <p className='text-slate-600 dark:text-slate-400'>
                                    {analysis.jobTitle} {analysis.company && `at ${analysis.company}`}
                                </p>
                            </div>
                            <button
                                onClick={handleDownloadReport}
                                className='flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-sm'
                            >
                                <Download className='w-5 h-5' />
                                {t('downloadReport')}
                            </button>
                        </div>

                        <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-800 overflow-hidden'>
                            <div className={`h-2 bg-gradient-to-r ${getScoreBg(analysis.atsScore)}`} />
                            <div className='p-8 text-center'>
                                <Target className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(analysis.atsScore)}`} />
                                <h3 className='text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2'>{t('atsMatchScore')}</h3>
                                <div className={`text-7xl font-bold mb-2 ${getScoreColor(analysis.atsScore)}`}>
                                    {analysis.atsScore}
                                </div>
                                <p className='text-slate-500 dark:text-slate-400 text-lg'>{t('outOf100')}</p>
                                <div className='mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full'>
                                    <BarChart3 className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                                    <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                                        {analysis.matchRate}% {t('keywordMatch')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='grid md:grid-cols-3 gap-6'>
                            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6'>
                                <Award className='w-10 h-10 text-purple-600 dark:text-purple-400 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2'>{t('hardSkills')}</h3>
                                <div className='text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2'>
                                    {analysis.hardSkillsScore}
                                </div>
                                <p className='text-sm text-slate-500 dark:text-slate-400'>
                                    {analysis.hardSkillsMatched?.length} {t('skillsMatched')}
                                </p>
                            </div>

                            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6'>
                                <Lightbulb className='w-10 h-10 text-blue-600 dark:text-blue-400 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2'>{t('softSkills')}</h3>
                                <div className='text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2'>
                                    {analysis.softSkillsScore}
                                </div>
                                <p className='text-sm text-slate-500 dark:text-slate-400'>
                                    {analysis.softSkillsMatched?.length} {t('skillsMatched')}
                                </p>
                            </div>

                            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6'>
                                <TrendingUp className='w-10 h-10 text-green-600 dark:text-green-400 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2'>{t('experienceLabel')}</h3>
                                <div className='text-4xl font-bold text-green-600 dark:text-green-400 mb-2'>
                                    {analysis.experienceMatch?.found || 0}
                                    <span className='text-2xl text-slate-400 dark:text-slate-500'>/{analysis.experienceMatch?.required || 0}</span>
                                </div>
                                <p className='text-sm text-slate-500 dark:text-slate-400'>{t('yearsExperience')}</p>
                            </div>
                        </div>

                        <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8'>
                            <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2'>
                                <BarChart3 className='w-6 h-6 text-indigo-600 dark:text-indigo-400' />
                                {t('sectionBreakdown')}
                            </h3>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                                {Object.entries(analysis.sectionScores).map(([section, score]) => (
                                    <div key={section} className='text-center'>
                                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
                                            {score}
                                        </div>
                                        <p className='text-sm font-medium text-slate-600 dark:text-slate-400 capitalize'>
                                            {section}
                                        </p>
                                        <div className='mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
                                            <div
                                                className={`h-2 rounded-full bg-gradient-to-r ${getScoreBg(score)}`}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='grid md:grid-cols-2 gap-6'>
                            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <CheckCircle2 className='w-7 h-7 text-green-600 dark:text-green-400' />
                                    <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{t('matchedKeywords')}</h3>
                                    <span className='ml-auto px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold'>
                                        {analysis.matchedKeywords.length}
                                    </span>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {analysis.matchedKeywords.map((kw, i) => (
                                        <span key={i} className='px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800'>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <XCircle className='w-7 h-7 text-red-600 dark:text-red-400' />
                                    <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{t('missingKeywords')}</h3>
                                    <span className='ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold'>
                                        {analysis.missingKeywords.length}
                                    </span>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {analysis.missingKeywords.map((kw, i) => (
                                        <span key={i} className='px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800'>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {analysis.suggestions && (
                            <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <Sparkles className='w-7 h-7 text-amber-600 dark:text-amber-400' />
                                    <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>{t('aiPoweredSuggestions')}</h3>
                                </div>

                                <div className='space-y-6'>
                                    {analysis.suggestions.improvedSummary && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>{t('optimizedProfessionalSummary')}</h4>
                                            <p className='text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed'>
                                                {analysis.suggestions.improvedSummary}
                                            </p>
                                        </div>
                                    )}

                                    {analysis.suggestions.skillsToAdd?.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>{t('addTheseSkills')}</h4>
                                            <div className='flex flex-wrap gap-2'>
                                                {analysis.suggestions.skillsToAdd.map((s, i) => (
                                                    <span key={i} className='px-4 py-2 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 rounded-lg text-sm font-medium border-2 border-amber-300 dark:border-amber-700'>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.suggestions.overallTips?.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>{t('optimizationTips')}</h4>
                                            <ul className='space-y-3'>
                                                {analysis.suggestions.overallTips.map((tip, i) => (
                                                    <li key={i} className='flex items-start gap-3 text-slate-700 dark:text-slate-300'>
                                                        <ArrowRight className='w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5' />
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ATS