import Resume from "../models/Resume.js"
import JobAnalysis from "../models/JobAnalysis.js"
import groq from "../configs/ai.js"

// ==================== HELPER FUNCTION ====================

async function callGroq(systemPrompt, userPrompt, jsonMode = false) {
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ]

    const config = {
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        max_tokens: 2000
    }

    if (jsonMode) {
        config.response_format = { type: "json_object" }
    }

    const response = await groq.chat.completions.create(config)
    return response.choices[0].message.content
}

// ==================== EXISTING FUNCTIONS ====================

export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body
        if (!userContent) {
            return res.status(400).json({ message: "Missing Required Field" })
        }

        const systemPrompt = "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-3 sentences and highlight the key skills, experience and career objectives. Make it compelling and ATS-friendly. Return ONLY the enhanced text, no preamble."

        const enhancedContent = await callGroq(systemPrompt, userContent, false)
        
        return res.status(200).json({ enhancedContent: enhancedContent.trim() })
    } catch (error) {
        console.error('Error:', error)
        return res.status(400).json({ message: error.message })
    }
}

export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body
        if (!userContent) {
            return res.status(400).json({ message: "Missing Required Field" })
        }

        const systemPrompt = "You are an expert in resume writing. Your task is to enhance the job description. The description should be 1-3 sentences and highlight key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. Return ONLY the enhanced text, no preamble."

        const enhancedContent = await callGroq(systemPrompt, userContent, false)
        
        return res.status(200).json({ enhancedContent: enhancedContent.trim() })
    } catch (error) {
        console.error('Error:', error)
        return res.status(400).json({ message: error.message })
    }
}

export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body
        const userId = req.userId

        if (!resumeText || !title) {
            return res.status(400).json({ message: "Missing Required Field" })
        }

        console.log('📄 Extracting resume data with Groq...')

        const systemPrompt = "You are an expert AI Agent that extracts data from resumes. You MUST respond with ONLY valid JSON, no markdown, no explanations."

        const userPrompt = `Extract data from this resume and return ONLY valid JSON:

${resumeText}

Required JSON format:
{
    "professional_summary": "",
    "skills": [],
    "personal_info": {
        "image": "",
        "full_name": "",
        "profession": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "website": ""
    },
    "experience": [
        {
            "company": "",
            "position": "",
            "start_date": "",
            "end_date": "",
            "description": "",
            "is_current": false
        }
    ],
    "project": [
        {
            "name": "",
            "type": "",
            "description": ""
        }
    ],
    "education": [
        {
            "institution": "",
            "degree": "",
            "field": "",
            "graduation_date": "",
            "gpa": ""
        }
    ]
}`

        const extractedData = await callGroq(systemPrompt, userPrompt, true)
        
        // Clean the response (remove any markdown code blocks)
        let cleanData = extractedData.trim()
        cleanData = cleanData.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        const parseData = JSON.parse(cleanData)
        
        const newResume = await Resume.create({ userId, title, ...parseData })

        console.log('✅ Resume created successfully')
        res.json({ resumeId: newResume._id })
    } catch (error) {
        console.error('Upload resume error:', error)
        return res.status(400).json({ message: error.message })
    }
}

// ==================== SMART ATS ANALYZER ====================

const SOFT_SKILL_INDICATORS = {
    'leadership': [
        'led', 'managed', 'supervised', 'coordinated', 'directed',
        'mentored', 'guided', 'oversaw', 'team lead', 'project manager'
    ],
    'communication': [
        'presented', 'documented', 'collaborated', 'liaised', 'conveyed',
        'articulated', 'facilitated', 'negotiated', 'consulted', 'briefed'
    ],
    'teamwork': [
        'collaborated', 'cooperated', 'team', 'group project', 'cross-functional',
        'partnered', 'contributed', 'worked with', 'team member'
    ],
    'problem solving': [
        'solved', 'resolved', 'debugged', 'troubleshot', 'identified',
        'analyzed', 'optimized', 'improved', 'enhanced', 'fixed'
    ],
    'analytical thinking': [
        'analyzed', 'evaluated', 'assessed', 'investigated', 'examined',
        'researched', 'data analysis', 'metrics', 'measured'
    ],
    'time management': [
        'deadline', 'prioritized', 'scheduled', 'planned', 'organized',
        'multitasked', 'managed time', 'efficient'
    ],
    'adaptability': [
        'adapted', 'flexible', 'learned', 'transitioned', 'adjusted',
        'versatile', 'various', 'diverse'
    ],
    'attention to detail': [
        'accurate', 'precise', 'thorough', 'meticulous', 'detailed',
        'reviewed', 'verified', 'quality'
    ]
}

const resumeToText = (resume) => {
    let text = ''
    
    if (resume.professional_summary) text += resume.professional_summary + ' '
    if (resume.skills?.length > 0) text += resume.skills.join(' ') + ' '
    
    if (resume.experience?.length > 0) {
        resume.experience.forEach(exp => {
            text += `${exp.position || ''} ${exp.company || ''} ${exp.description || ''} `
        })
    }
    
    if (resume.project?.length > 0) {
        resume.project.forEach(proj => {
            text += `${proj.name || ''} ${proj.description || ''} `
        })
    }
    
    if (resume.education?.length > 0) {
        resume.education.forEach(edu => {
            text += `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''} `
        })
    }
    
    return text
}

const detectSoftSkillsFromContext = (resumeText) => {
    const detectedSkills = []
    const resumeLower = resumeText.toLowerCase()
    
    for (const [skill, indicators] of Object.entries(SOFT_SKILL_INDICATORS)) {
        const hasEvidence = indicators.some(indicator => 
            resumeLower.includes(indicator.toLowerCase())
        )
        
        if (hasEvidence) {
            detectedSkills.push(skill)
        }
    }
    
    return detectedSkills
}

const extractStructuredKeywords = async (resumeText, jobDescription) => {
    try {
        const systemPrompt = `You are an ATS keyword extraction expert. Extract keywords EXACTLY as they appear. Be conservative - only extract exact matches. Return ONLY valid JSON.`

        const userPrompt = `Extract keywords from resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return this exact JSON structure:
{
    "resumeKeywords": {
        "hardSkills": ["Python", "SQL"],
        "softSkills": [],
        "allKeywords": ["Python", "SQL"]
    },
    "jobKeywords": {
        "hardSkills": ["Python", "Java", "SQL"],
        "softSkills": ["leadership", "communication"],
        "allKeywords": ["Python", "Java", "SQL", "leadership"]
    },
    "experienceYears": {
        "required": 3,
        "found": 2
    },
    "education": {
        "required": "Bachelor",
        "found": "Bachelor"
    }
}`

        const resultText = await callGroq(systemPrompt, userPrompt, true)
        
        // Clean response
        let cleanData = resultText.trim()
        cleanData = cleanData.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        const result = JSON.parse(cleanData)
        
        // Add soft skill detection
        const detectedSoftSkills = detectSoftSkillsFromContext(resumeText)
        result.resumeKeywords.softSkills = detectedSoftSkills
        result.resumeKeywords.allKeywords = [
            ...result.resumeKeywords.hardSkills,
            ...detectedSoftSkills
        ]
        
        return result
    } catch (error) {
        console.error('Keyword extraction error:', error)
        return null
    }
}

const matchKeywords = (resumeKeywords, jobKeywords) => {
    const resumeAllLower = resumeKeywords.allKeywords.map(k => k.toLowerCase().trim())
    const jobAllLower = jobKeywords.allKeywords.map(k => k.toLowerCase().trim())
    
    const matchedLower = jobAllLower.filter(jobKw => resumeAllLower.includes(jobKw))
    const missingLower = jobAllLower.filter(jobKw => !resumeAllLower.includes(jobKw))
    
    const resumeHardLower = resumeKeywords.hardSkills.map(s => s.toLowerCase().trim())
    const jobHardLower = jobKeywords.hardSkills.map(s => s.toLowerCase().trim())
    const hardSkillsMatchedLower = jobHardLower.filter(skill => resumeHardLower.includes(skill))
    
    const resumeSoftLower = resumeKeywords.softSkills.map(s => s.toLowerCase().trim())
    const jobSoftLower = jobKeywords.softSkills.map(s => s.toLowerCase().trim())
    const softSkillsMatchedLower = jobSoftLower.filter(skill => resumeSoftLower.includes(skill))
    
    return {
        hardSkillsMatched: hardSkillsMatchedLower,
        softSkillsMatched: softSkillsMatchedLower,
        matched: matchedLower,
        missing: missingLower,
        hardSkillsScore: jobKeywords.hardSkills.length > 0 
            ? Math.round((hardSkillsMatchedLower.length / jobKeywords.hardSkills.length) * 100)
            : 100,
        softSkillsScore: jobKeywords.softSkills.length > 0
            ? Math.round((softSkillsMatchedLower.length / jobKeywords.softSkills.length) * 100)
            : 100
    }
}

const matchEducation = (resume, jobDescription) => {
    if (!resume.education || resume.education.length === 0) {
        return { hasEducation: false, degreeMatch: false, fieldMatch: false, score: 0 }
    }
    return { hasEducation: true, degreeMatch: true, fieldMatch: true, score: 80 }
}

const calculateSectionScores = (resume, jobKeywords, matchResult, experienceYears, jobDescription) => {
    const scores = {}
    
    scores.skills = matchResult.hardSkillsScore
    
    let experienceScore = 0
    if (resume.experience?.length > 0) {
        const yearsScore = experienceYears.required > 0
            ? Math.min((experienceYears.found / experienceYears.required) * 50, 50)
            : 25
        
        const expText = resume.experience.map(e => e.description || '').join(' ').toLowerCase()
        const jobKeywordsLower = jobKeywords.allKeywords.map(k => k.toLowerCase().trim())
        const expMatches = jobKeywordsLower.filter(kw => expText.includes(kw))
        const keywordScore = jobKeywordsLower.length > 0
            ? (expMatches.length / jobKeywordsLower.length) * 50
            : 25
        
        experienceScore = Math.round(yearsScore + keywordScore)
    }
    
    scores.experience = Math.min(experienceScore, 100)
    scores.education = matchEducation(resume, jobDescription).score
    
    return scores
}

export const analyzeJobMatch = async (req, res) => {
    try {
        const { resumeId, jobDescription, jobTitle, company } = req.body
        const userId = req.userId

        if (!resumeId || !jobDescription) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const resume = await Resume.findOne({ userId, _id: resumeId })
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        console.log('🔍 Starting ATS analysis with Groq...')

        const resumeText = resumeToText(resume)
        const extracted = await extractStructuredKeywords(resumeText, jobDescription)
        
        if (!extracted) {
            return res.status(500).json({ message: "Keyword extraction failed" })
        }

        const matchResult = matchKeywords(extracted.resumeKeywords, extracted.jobKeywords)
        const sectionScores = calculateSectionScores(
            resume, 
            extracted.jobKeywords, 
            matchResult,
            extracted.experienceYears,
            jobDescription
        )

        const atsScore = Math.round(
            (sectionScores.skills + sectionScores.experience + sectionScores.education) / 3
        )

        console.log('🎯 ATS Score:', atsScore)

        // Generate suggestions
        const systemPrompt = "You are an ATS resume optimizer. Provide specific, actionable suggestions. Return ONLY valid JSON."

        const userPrompt = `ATS Score: ${atsScore}/100
Missing Keywords: ${matchResult.missing.join(', ')}

Return this exact JSON:
{
    "improvedSummary": "Write a better 2-3 sentence summary with missing keywords",
    "skillsToAdd": ["skill1", "skill2", "skill3"],
    "experienceImprovements": ["tip1", "tip2"],
    "overallTips": ["tip1", "tip2", "tip3"]
}`

        const suggestionText = await callGroq(systemPrompt, userPrompt, true)
        let cleanSuggestions = suggestionText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '')
        const suggestions = JSON.parse(cleanSuggestions)

        const analysis = await JobAnalysis.create({
            userId,
            resumeId,
            jobDescription,
            jobTitle: jobTitle || 'Untitled Position',
            company: company || '',
            atsScore,
            matchedKeywords: matchResult.matched,
            missingKeywords: matchResult.missing,
            hardSkillsScore: matchResult.hardSkillsScore,
            softSkillsScore: matchResult.softSkillsScore,
            sectionScores,
            suggestions
        })

        console.log('✅ Analysis complete')
        
        return res.status(200).json({
            analysisId: analysis._id,
            atsScore,
            matchedKeywords: matchResult.matched,
            missingKeywords: matchResult.missing,
            hardSkillsScore: matchResult.hardSkillsScore,
            softSkillsScore: matchResult.softSkillsScore,
            sectionScores,
            suggestions
        })

    } catch (error) {
        console.error('Analysis error:', error)
        return res.status(400).json({ message: error.message })
    }
}

export const getAnalysisHistory = async (req, res) => {
    try {
        const { resumeId } = req.params
        const userId = req.userId

        const analyses = await JobAnalysis.find({ userId, resumeId })
            .sort({ createdAt: -1 })
            .limit(10)

        return res.status(200).json({ analyses })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export const applySuggestions = async (req, res) => {
    try {
        const { resumeId, suggestions } = req.body
        const userId = req.userId

        if (!resumeId || !suggestions) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const resume = await Resume.findOne({ userId, _id: resumeId })
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        if (suggestions.improvedSummary) {
            resume.professional_summary = suggestions.improvedSummary
        }

        if (suggestions.skillsToAdd?.length > 0) {
            const existingSkills = resume.skills.map(s => s.toLowerCase())
            suggestions.skillsToAdd.forEach(skill => {
                if (!existingSkills.includes(skill.toLowerCase())) {
                    resume.skills.push(skill)
                }
            })
        }

        await resume.save()

        return res.status(200).json({
            message: "Suggestions applied successfully",
            resume
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


export const importFromLinkedIn = async (req, res) => {
    try {
        const { profileText } = req.body
        const userId = req.userId

        if (!profileText || !profileText.trim()) {
            return res.status(400).json({ message: "Please provide LinkedIn profile content" })
        }

        console.log('📋 Parsing LinkedIn profile with Groq...')

        const systemPrompt = `You are an expert at parsing LinkedIn profile text and converting it to structured resume data. Extract ALL relevant information including experience, education, skills, and personal details. Return ONLY valid JSON, no markdown, no explanations.`

        const userPrompt = `Parse this LinkedIn profile text into resume format:

${profileText}

Return this exact JSON structure:
{
    "professional_summary": "2-3 sentence professional summary based on the profile",
    "skills": ["skill1", "skill2", "skill3"],
    "personal_info": {
        "full_name": "",
        "profession": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "website": ""
    },
    "experience": [
        {
            "company": "",
            "position": "",
            "start_date": "",
            "end_date": "",
            "description": "Brief description of role and achievements",
            "is_current": false
        }
    ],
    "project": [
        {
            "name": "",
            "type": "",
            "description": ""
        }
    ],
    "education": [
        {
            "institution": "",
            "degree": "",
            "field": "",
            "graduation_date": "",
            "gpa": ""
        }
    ]
}

Extract as much information as possible from the LinkedIn profile text.`

        const result = await callGroq(systemPrompt, userPrompt, true)
        
        // Clean the response
        let cleanData = result.trim()
        cleanData = cleanData.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        const resumeData = JSON.parse(cleanData)

        console.log('✅ LinkedIn profile parsed successfully')
        
        return res.status(200).json({ 
            message: "LinkedIn profile imported successfully",
            resumeData
        })

    } catch (error) {
        console.error('LinkedIn import error:', error)
        return res.status(400).json({ 
            message: error.message || "Failed to parse LinkedIn profile. Please try again."
        })
    }
}