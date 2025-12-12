import React, { useState, useEffect, useRef } from 'react'
import { 
    FileSearch, Sparkles, CheckCircle2, XCircle, Loader2, 
    Target, ArrowRight, Award, BarChart3, Upload, FileText, Lightbulb, TrendingUp, Download
} from 'lucide-react'

const ATS = () => {
    const reportRef = useRef(null)
    const resumeFileInputRef = useRef(null)

    const [resumeFile, setResumeFile] = useState(null)
    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [company, setCompany] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
    const [isDraggingResume, setIsDraggingResume] = useState(false)

    const handleResumeFileSelect = async (file) => {
        if (!file) return
        
        setResumeFile(file)
        
        // Read file content
        const reader = new FileReader()
        reader.onload = (e) => {
            setResumeText(e.target.result)
        }
        reader.readAsText(file)
    }

    const handleResumeDrop = (e) => {
        e.preventDefault()
        setIsDraggingResume(false)
        const file = e.dataTransfer.files[0]
        if (file && (file.type.includes('text') || file.type.includes('pdf') || file.type.includes('word'))) {
            handleResumeFileSelect(file)
        }
    }

    const simulateAnalysis = () => {
        // Simulate AI analysis
        const matchedKeywords = ['React', 'JavaScript', 'Node.js', 'MongoDB', 'REST API', 'Git']
        const missingKeywords = ['TypeScript', 'Docker', 'AWS', 'CI/CD', 'Kubernetes']
        
        const matchRate = Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
        const atsScore = 65 + Math.floor(Math.random() * 20)
        
        return {
            atsScore,
            matchRate,
            jobTitle: jobTitle || 'Full Stack Developer',
            company: company || 'Tech Company',
            analyzedAt: new Date().toISOString(),
            hardSkillsScore: 70 + Math.floor(Math.random() * 20),
            softSkillsScore: 75 + Math.floor(Math.random() * 15),
            hardSkillsMatched: ['React', 'Node.js', 'MongoDB'],
            softSkillsMatched: ['Leadership', 'Communication'],
            experienceMatch: { found: 3, required: 5 },
            matchedKeywords,
            missingKeywords,
            sectionScores: {
                summary: 78,
                skills: 85,
                experience: 72,
                education: 90
            },
            suggestions: {
                improvedSummary: 'Results-driven Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and MongoDB. Proven track record of delivering high-quality solutions that improve user engagement by 40%.',
                skillsToAdd: missingKeywords,
                overallTips: [
                    'Add more quantifiable achievements to your experience section',
                    'Include specific technologies mentioned in the job description',
                    'Highlight your leadership experience in team projects',
                    'Add relevant certifications if you have them'
                ]
            }
        }
    }

    const handleAnalyze = async () => {
        if (!resumeFile || !jobDescription.trim()) {
            alert('Please upload a resume and paste job description')
            return
        }

        setIsAnalyzing(true)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const analysisResult = simulateAnalysis()
        setAnalysis(analysisResult)
        
        setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
        
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

MATCHED KEYWORDS (${analysis.matchedKeywords.length})
${analysis.matchedKeywords.map(k => `✓ ${k}`).join('\n')}

MISSING KEYWORDS (${analysis.missingKeywords.length})
${analysis.missingKeywords.map(k => `✗ ${k}`).join('\n')}

AI SUGGESTIONS
--------------
${analysis.suggestions.improvedSummary ? `Improved Summary:\n${analysis.suggestions.improvedSummary}\n\n` : ''}
${analysis.suggestions.overallTips?.length > 0 ? `Tips:\n${analysis.suggestions.overallTips.map(t => `• ${t}`).join('\n')}` : ''}
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
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-green-500 to-green-600'
        if (score >= 60) return 'from-yellow-500 to-yellow-600'
        return 'from-red-500 to-red-600'
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white'>
            <div className='max-w-7xl mx-auto px-4 py-12'>
                
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center gap-3 mb-4'>
                        <div className='p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg'>
                            <FileSearch className='w-8 h-8 text-white' />
                        </div>
                    </div>
                    <h1 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4'>
                        ATS Resume Analyzer
                    </h1>
                    <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
                        Get instant AI-powered analysis of how well your resume matches the job
                    </p>
                </div>

                <div className='bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8'>
                    <div className='grid md:grid-cols-2 gap-6'>
                        
                        {/* Left Column - Resume Upload */}
                        <div className='space-y-6'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Upload Your Resume *
                                </label>
                                
                                <div 
                                    onDragOver={(e) => {e.preventDefault(); setIsDraggingResume(true)}}
                                    onDragLeave={() => setIsDraggingResume(false)} 
                                    onDrop={handleResumeDrop}
                                    className={`border-2 border-dashed rounded-xl transition-all ${
                                        isDraggingResume 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-slate-300'
                                    }`}
                                >
                                    {!resumeFile ? (
                                        <div className='p-8 text-center'>
                                            <FileText className='w-12 h-12 mx-auto mb-3 text-slate-400' />
                                            <p className='text-sm font-medium text-slate-600 mb-1'>
                                                Drag & Drop or{' '}
                                                <button 
                                                    onClick={() => resumeFileInputRef.current?.click()} 
                                                    className='text-indigo-600 hover:underline'
                                                >
                                                    Choose file
                                                </button>
                                                {' '}to upload
                                            </p>
                                            <p className='text-xs text-slate-500'>PDF, DOCX, or TXT file</p>
                                        </div>
                                    ) : (
                                        <div className='p-6'>
                                            <div className='flex items-center gap-3 mb-3'>
                                                <FileText className='w-10 h-10 text-green-600' />
                                                <div className='flex-1'>
                                                    <p className='font-medium text-slate-900'>{resumeFile.name}</p>
                                                    <p className='text-sm text-slate-500'>
                                                        {(resumeFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                                <CheckCircle2 className='w-6 h-6 text-green-600' />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setResumeFile(null)
                                                    setResumeText('')
                                                }}
                                                className='text-sm text-red-600 hover:underline'
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    ref={resumeFileInputRef} 
                                    type="file" 
                                    accept=".pdf,.docx,.txt" 
                                    hidden 
                                    onChange={(e) => handleResumeFileSelect(e.target.files[0])} 
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Job Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder='e.g., Senior Full Stack Developer'
                                    className='w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 transition-all'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                    Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder='e.g., Google'
                                    className='w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 transition-all'
                                />
                            </div>
                        </div>

                        {/* Right Column - Job Description */}
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                Paste Job Description *
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
                                className='w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 resize-none focus:border-indigo-500 transition-all'
                            />
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center'>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                            className='group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none transition-all disabled:cursor-not-allowed flex items-center gap-3'
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className='w-6 h-6 animate-spin' />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className='w-6 h-6' />
                                    Analyze Match
                                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {analysis && (
                    <div ref={reportRef} className='space-y-8'>
                        
                        <div className='flex items-center justify-between bg-white rounded-2xl shadow-lg border border-slate-200 p-6'>
                            <div>
                                <h2 className='text-2xl font-bold text-slate-900 mb-1'>Analysis Results</h2>
                                <p className='text-slate-600'>
                                    {analysis.jobTitle} {analysis.company && `at ${analysis.company}`}
                                </p>
                            </div>
                            <button
                                onClick={handleDownloadReport}
                                className='flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-medium transition-colors shadow-sm'
                            >
                                <Download className='w-5 h-5' />
                                Download Report
                            </button>
                        </div>

                        <div className='bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden'>
                            <div className={`h-2 bg-gradient-to-r ${getScoreBg(analysis.atsScore)}`} />
                            <div className='p-8 text-center'>
                                <Target className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(analysis.atsScore)}`} />
                                <h3 className='text-sm font-semibold text-slate-600 uppercase mb-2'>ATS Match Score</h3>
                                <div className={`text-7xl font-bold mb-2 ${getScoreColor(analysis.atsScore)}`}>
                                    {analysis.atsScore}
                                </div>
                                <p className='text-slate-500 text-lg'>out of 100</p>
                                <div className='mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full'>
                                    <BarChart3 className='w-4 h-4 text-indigo-600' />
                                    <span className='text-sm font-medium text-slate-700'>
                                        {analysis.matchRate}% keyword match
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='grid md:grid-cols-3 gap-6'>
                            <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-6'>
                                <Award className='w-10 h-10 text-purple-600 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 uppercase mb-2'>Hard Skills</h3>
                                <div className='text-4xl font-bold text-purple-600 mb-2'>
                                    {analysis.hardSkillsScore}
                                </div>
                                <p className='text-sm text-slate-500'>
                                    {analysis.hardSkillsMatched?.length} skills matched
                                </p>
                            </div>

                            <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-6'>
                                <Lightbulb className='w-10 h-10 text-blue-600 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 uppercase mb-2'>Soft Skills</h3>
                                <div className='text-4xl font-bold text-blue-600 mb-2'>
                                    {analysis.softSkillsScore}
                                </div>
                                <p className='text-sm text-slate-500'>
                                    {analysis.softSkillsMatched?.length} skills matched
                                </p>
                            </div>

                            <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-6'>
                                <TrendingUp className='w-10 h-10 text-green-600 mb-4' />
                                <h3 className='text-sm font-semibold text-slate-600 uppercase mb-2'>Experience</h3>
                                <div className='text-4xl font-bold text-green-600 mb-2'>
                                    {analysis.experienceMatch?.found || 0}
                                    <span className='text-2xl text-slate-400'>/{analysis.experienceMatch?.required || 0}</span>
                                </div>
                                <p className='text-sm text-slate-500'>years experience</p>
                            </div>
                        </div>

                        <div className='grid md:grid-cols-2 gap-6'>
                            <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <CheckCircle2 className='w-7 h-7 text-green-600' />
                                    <h3 className='text-xl font-bold text-slate-900'>Matched Keywords</h3>
                                    <span className='ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold'>
                                        {analysis.matchedKeywords.length}
                                    </span>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {analysis.matchedKeywords.map((kw, i) => (
                                        <span key={i} className='px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200'>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className='bg-white rounded-2xl shadow-lg border border-slate-200 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <XCircle className='w-7 h-7 text-red-600' />
                                    <h3 className='text-xl font-bold text-slate-900'>Missing Keywords</h3>
                                    <span className='ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold'>
                                        {analysis.missingKeywords.length}
                                    </span>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {analysis.missingKeywords.map((kw, i) => (
                                        <span key={i} className='px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200'>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {analysis.suggestions && (
                            <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <Sparkles className='w-7 h-7 text-amber-600' />
                                    <h3 className='text-2xl font-bold text-slate-900'>AI-Powered Suggestions</h3>
                                </div>

                                <div className='space-y-6'>
                                    {analysis.suggestions.improvedSummary && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3'>Optimized Professional Summary</h4>
                                            <p className='text-slate-700 bg-white p-4 rounded-xl border border-slate-200'>
                                                {analysis.suggestions.improvedSummary}
                                            </p>
                                        </div>
                                    )}

                                    {analysis.suggestions.skillsToAdd?.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3'>Add These Skills</h4>
                                            <div className='flex flex-wrap gap-2'>
                                                {analysis.suggestions.skillsToAdd.map((s, i) => (
                                                    <span key={i} className='px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium border-2 border-amber-300'>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.suggestions.overallTips?.length > 0 && (
                                        <div>
                                            <h4 className='font-semibold text-slate-900 mb-3'>Optimization Tips</h4>
                                            <ul className='space-y-3'>
                                                {analysis.suggestions.overallTips.map((tip, i) => (
                                                    <li key={i} className='flex items-start gap-3 text-slate-700'>
                                                        <ArrowRight className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' />
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