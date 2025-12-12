import Resume from "../models/Resume.js"
import JobAnalysis from "../models/JobAnalysis.js"
import ai from "../configs/ai.js"

// ==================== EXISTING FUNCTIONS ====================

export const enhanceProfessionalSummary = async (req,res) => {
    try {
        const {userContent} = req.body
        if(!userContent){
            return res.status(400).json({message: "Missing Requires Field"})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL, 
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-3 sentences also highlights the key skills, experience and career objectives. Make it compelling and ATS-friendly and only retun text no option or anything else." },
                { role: "user", content: userContent }
            ],
        })

        const enhancedContent = response.choices[0].message.content
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

export const enhanceJobDescription = async (req,res) => {
    try {
        const {userContent} = req.body
        if(!userContent){
            return res.state(400).json({message: "Missing Requires Field"})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL, 
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only 1-3 sentences also highlights the key responsibilties and achievements.Use action verbs and quantifiable results where possible. Make it  ATS-friendly and only retun text no option or anything else." },
                { role: "user", content: userContent }
            ],
        })

        const enhancedContent = response.choices[0].message.content
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

export const uploadResume = async (req,res) => {
    try {
        const {resumeText,title} = req.body
        const userId = req.userId

        if(!resumeText || !title){
            return res.status(400).json({message: "Missing Requires Field"})
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume"
        const userPrompt = `extract data from this resume: ${resumeText}
        Provide data in the following JSON format with no additional text before or after: 
        {
            professional_summary: {type: String, default:" "},
            skills: [{type: String}],
            personal_info: {
                image: {type: String, default:""},
                full_name: {type: String, default:""},
                profession: {type: String, default:""},
                email: {type: String, default:""},
                phone: {type: String, default:""},
                location: {type: String, default:""},
                linkedin: {type: String, default:""},
                website: {type: String, default:""},
            },
            experience:[
                {
                    company: {type: String},
                    position: {type: String},
                    start_date: {type: String},
                    end_date: {type: String},
                    description: {type: String},
                    is_current: {type: Boolean},
                }
            ],
            project: [
                {
                    name: {type: String},
                    type: {type: String},
                    description: {type: String},
                }
            ],
            educaiton:[
                {
                    institution: {type: String},
                    degree: {type: String},
                    field: {type: String},
                    graduation_date: {type: String},
                    gpa: {type: String},
                }
            ],
        }`
        
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL, 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format:{type: 'json_object'}
        })

        const extractedData = response.choices[0].message.content
        const parseData = JSON.parse(extractedData)
        const newResume = await Resume.create({userId,title,...parseData})

        res.json({resumeId: newResume._id})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// ==================== CLEAN JOB ANALYZER ====================

// Helper: Convert resume to text
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
            text += `${edu.degree || ''} ${edu.field || ''} `
        })
    }
    
    return text
}

// STEP 1: Extract keywords from BOTH resume and job
const extractStructuredKeywords = async (resumeText, jobDescription) => {
    const systemPrompt = `You are an ATS expert. Extract and categorize keywords from both resume and job description.`

    const userPrompt = `Extract keywords from this resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return JSON format:
{
    "resumeKeywords": {
        "hardSkills": ["React", "Python"],
        "softSkills": ["Leadership", "Communication"],
        "allKeywords": ["React", "Python", "Leadership"]
    },
    "jobKeywords": {
        "hardSkills": ["React", "Docker"],
        "softSkills": ["Teamwork"],
        "allKeywords": ["React", "Docker", "Teamwork"]
    },
    "experienceYears": {
        "required": 5,
        "found": 3
    },
    "education": {
        "required": "Bachelor",
        "found": "Bachelor"
    }
}`

    try {
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        })

        return JSON.parse(response.choices[0].message.content)
    } catch (error) {
        console.error('Keyword extraction error:', error)
        return null
    }
}

// STEP 2: Match keywords
const matchKeywords = (resumeKeywords, jobKeywords) => {
    const resumeAll = resumeKeywords.allKeywords.map(k => k.toLowerCase())
    const jobAll = jobKeywords.allKeywords.map(k => k.toLowerCase())
    
    // Hard skills matching
    const hardSkillsMatched = jobKeywords.hardSkills.filter(skill =>
        resumeKeywords.hardSkills.some(rSkill => 
            rSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(rSkill.toLowerCase())
        )
    )
    
    // Soft skills matching
    const softSkillsMatched = jobKeywords.softSkills.filter(skill =>
        resumeKeywords.softSkills.some(rSkill => 
            rSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(rSkill.toLowerCase())
        )
    )
    
    // All keywords matching
    const matched = jobAll.filter(jobKw =>
        resumeAll.some(resumeKw =>
            resumeKw.includes(jobKw) || jobKw.includes(resumeKw)
        )
    )
    
    const missing = jobAll.filter(jobKw =>
        !resumeAll.some(resumeKw =>
            resumeKw.includes(jobKw) || jobKw.includes(resumeKw)
        )
    )
    
    return {
        hardSkillsMatched,
        softSkillsMatched,
        matched,
        missing,
        hardSkillsScore: jobKeywords.hardSkills.length > 0 
            ? Math.round((hardSkillsMatched.length / jobKeywords.hardSkills.length) * 100)
            : 100,
        softSkillsScore: jobKeywords.softSkills.length > 0
            ? Math.round((softSkillsMatched.length / jobKeywords.softSkills.length) * 100)
            : 100
    }
}

// STEP 3: Calculate section scores
const calculateSectionScores = (resume, jobKeywords) => {
    const scores = {}
    
    // Summary score
    if (resume.professional_summary) {
        const summaryKeywords = jobKeywords.allKeywords.filter(kw =>
            resume.professional_summary.toLowerCase().includes(kw.toLowerCase())
        )
        scores.summary = jobKeywords.allKeywords.length > 0
            ? Math.round((summaryKeywords.length / jobKeywords.allKeywords.length) * 100)
            : 0
    } else {
        scores.summary = 0
    }
    
    // Skills score
    const resumeSkills = (resume.skills || []).map(s => s.toLowerCase())
    const skillsMatched = jobKeywords.hardSkills.filter(skill =>
        resumeSkills.some(rs => rs.includes(skill.toLowerCase()))
    )
    scores.skills = jobKeywords.hardSkills.length > 0
        ? Math.round((skillsMatched.length / jobKeywords.hardSkills.length) * 100)
        : 0
    
    // Experience score
    if (resume.experience?.length > 0) {
        const expText = resume.experience.map(e => e.description || '').join(' ').toLowerCase()
        const expKeywords = jobKeywords.allKeywords.filter(kw =>
            expText.includes(kw.toLowerCase())
        )
        scores.experience = jobKeywords.allKeywords.length > 0
            ? Math.round((expKeywords.length / jobKeywords.allKeywords.length) * 100)
            : 0
    } else {
        scores.experience = 0
    }
    
    // Education score
    scores.education = resume.education?.length > 0 ? 80 : 40
    
    return scores
}

// MAIN CONTROLLER: Analyze job match
// POST: /api/ai/analyze-job-match

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

        console.log('🔍 Starting analysis...')

        const resumeText = resumeToText(resume)

        // STEP 1: Extract keywords
        const extracted = await extractStructuredKeywords(resumeText, jobDescription)
        
        if (!extracted) {
            return res.status(500).json({ message: "Keyword extraction failed" })
        }

        // STEP 2: Match keywords
        const matchResult = matchKeywords(extracted.resumeKeywords, extracted.jobKeywords)

        // STEP 3: Calculate ATS score
        const atsScore = Math.round(
            (matchResult.hardSkillsScore * 0.5) +
            (matchResult.softSkillsScore * 0.2) +
            (extracted.experienceYears.found >= extracted.experienceYears.required ? 20 : 10) +
            (extracted.education.found ? 10 : 5)
        )

        // STEP 4: Calculate section scores
        const sectionScores = calculateSectionScores(resume, extracted.jobKeywords)

        // STEP 5: Generate AI suggestions
        const systemPrompt = `You are an ATS resume optimizer.`
        const userPrompt = `
ATS Score: ${atsScore}/100
Missing Keywords: ${matchResult.missing.join(', ')}

Provide suggestions in JSON:
{
    "improvedSummary": "Rewrite with missing keywords",
    "skillsToAdd": ["skill1", "skill2"],
    "experienceImprovements": ["tip1", "tip2"],
    "overallTips": ["tip1", "tip2"]
}`

        const aiResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        })

        const suggestions = JSON.parse(aiResponse.choices[0].message.content)

        // STEP 6: Save to database
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
            hardSkillsMatched: matchResult.hardSkillsMatched,
            softSkillsMatched: matchResult.softSkillsMatched,
            sectionScores,
            experienceMatch: extracted.experienceYears,
            educationMatch: extracted.education,
            suggestions
        })

        console.log('✅ Analysis complete!')
        
        // STEP 7: Return clean response
        return res.status(200).json({
            analysisId: analysis._id,
            atsScore,
            matchRate: Math.round((matchResult.matched.length / extracted.jobKeywords.allKeywords.length) * 100),
            matchedKeywords: matchResult.matched,
            missingKeywords: matchResult.missing,
            hardSkillsScore: matchResult.hardSkillsScore,
            softSkillsScore: matchResult.softSkillsScore,
            hardSkillsMatched: matchResult.hardSkillsMatched,
            softSkillsMatched: matchResult.softSkillsMatched,
            sectionScores,
            experienceMatch: extracted.experienceYears,
            educationMatch: extracted.education,
            suggestions,
            jobTitle: jobTitle || 'Untitled Position',
            company: company || '',
            analyzedAt: new Date().toISOString()
        })

    } catch (error) {
        console.error('❌ Analysis error:', error)
        return res.status(400).json({ message: error.message })
    }
}

// Get analysis history
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

// Apply suggestions
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