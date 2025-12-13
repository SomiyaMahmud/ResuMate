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
            education:[
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

// ==================== SMART ATS ANALYZER ====================

// Soft skill evidence keywords mapping
const SOFT_SKILL_INDICATORS = {
    'leadership': [
        'led', 'managed', 'supervised', 'coordinated', 'directed',
        'mentored', 'guided', 'oversaw', 'team lead', 'project manager',
        'executive', 'head of', 'organized', 'delegated', 'chief'
    ],
    'communication': [
        'presented', 'documented', 'collaborated', 'liaised', 'conveyed',
        'articulated', 'facilitated', 'negotiated', 'consulted', 'briefed',
        'public speaking', 'client meetings', 'stakeholder', 'wrote'
    ],
    'teamwork': [
        'collaborated', 'cooperated', 'team', 'group project', 'cross-functional',
        'partnered', 'contributed', 'worked with', 'team member', 'jointly'
    ],
    'problem solving': [
        'solved', 'resolved', 'debugged', 'troubleshot', 'identified',
        'analyzed', 'optimized', 'improved', 'enhanced', 'fixed',
        'addressed', 'overcome', 'innovated', 'developed'
    ],
    'analytical thinking': [
        'analyzed', 'evaluated', 'assessed', 'investigated', 'examined',
        'researched', 'data analysis', 'metrics', 'measured', 'interpreted',
        'statistical', 'quantitative'
    ],
    'time management': [
        'deadline', 'prioritized', 'scheduled', 'planned', 'organized',
        'multitasked', 'managed time', 'efficient', 'on time'
    ],
    'adaptability': [
        'adapted', 'flexible', 'learned', 'transitioned', 'adjusted',
        'versatile', 'various', 'diverse', 'changing'
    ],
    'attention to detail': [
        'accurate', 'precise', 'thorough', 'meticulous', 'detailed',
        'reviewed', 'verified', 'quality', 'error-free', 'carefully'
    ]
}

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
            text += `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''} `
        })
    }
    
    return text
}

// Function to detect soft skills from resume context
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

// STEP 1: Extract keywords from BOTH resume and job
const extractStructuredKeywords = async (resumeText, jobDescription) => {
    const systemPrompt = `You are an ATS keyword extraction expert.

CRITICAL RULES:
1. For HARD SKILLS: Extract ONLY exact technical keywords (programming languages, tools, frameworks, technologies)
2. For SOFT SKILLS: Extract required soft skills from job description
3. Extract ONLY keywords that appear word-for-word (case-insensitive is OK)
4. Multi-word phrases must match EXACTLY
5. Do NOT infer or assume - be extremely conservative`

    const userPrompt = `Extract keywords from resume and job description.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return JSON format:
{
    "resumeKeywords": {
        "hardSkills": ["Python", "SQL"],
        "softSkills": [],
        "allKeywords": ["Python", "SQL", "React"]
    },
    "jobKeywords": {
        "hardSkills": ["Python", "Java", "SQL"],
        "softSkills": ["leadership", "communication", "problem solving"],
        "allKeywords": ["Python", "Java", "SQL", "leadership", "communication"]
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

    try {
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0
        })

        const result = JSON.parse(response.choices[0].message.content)
        
        // SMART SOFT SKILL DETECTION: Infer from resume context
        const detectedSoftSkills = detectSoftSkillsFromContext(resumeText)
        result.resumeKeywords.softSkills = detectedSoftSkills
        
        // Update allKeywords with detected soft skills
        result.resumeKeywords.allKeywords = [
            ...result.resumeKeywords.hardSkills,
            ...detectedSoftSkills
        ]
        
        console.log('🎯 Detected soft skills from context:', detectedSoftSkills)
        
        return result
    } catch (error) {
        console.error('Keyword extraction error:', error)
        return null
    }
}

// STEP 2: Match keywords
const matchKeywords = (resumeKeywords, jobKeywords) => {
    const resumeAllLower = resumeKeywords.allKeywords.map(k => k.toLowerCase().trim())
    const jobAllLower = jobKeywords.allKeywords.map(k => k.toLowerCase().trim())
    
    console.log('📋 Resume keywords:', resumeAllLower)
    console.log('📋 Job keywords:', jobAllLower)
    
    // EXACT MATCH for all keywords
    const matchedLower = jobAllLower.filter(jobKw => 
        resumeAllLower.includes(jobKw)
    )
    
    const missingLower = jobAllLower.filter(jobKw => 
        !resumeAllLower.includes(jobKw)
    )
    
    // Hard skills matching
    const resumeHardLower = resumeKeywords.hardSkills.map(s => s.toLowerCase().trim())
    const jobHardLower = jobKeywords.hardSkills.map(s => s.toLowerCase().trim())
    
    const hardSkillsMatchedLower = jobHardLower.filter(skill =>
        resumeHardLower.includes(skill)
    )
    
    // Soft skills matching
    const resumeSoftLower = resumeKeywords.softSkills.map(s => s.toLowerCase().trim())
    const jobSoftLower = jobKeywords.softSkills.map(s => s.toLowerCase().trim())
    
    const softSkillsMatchedLower = jobSoftLower.filter(skill =>
        resumeSoftLower.includes(skill)
    )
    
    // Convert back to original casing for display
    const matched = [...new Set(matchedLower.map(kw => {
        const original = jobKeywords.allKeywords.find(jk => jk.toLowerCase().trim() === kw)
        return original || kw
    }))]
    
    const missing = [...new Set(missingLower.map(kw => {
        const original = jobKeywords.allKeywords.find(jk => jk.toLowerCase().trim() === kw)
        return original || kw
    }))]
    
    const hardSkillsMatched = hardSkillsMatchedLower.map(skill => {
        const original = jobKeywords.hardSkills.find(s => s.toLowerCase().trim() === skill)
        return original || skill
    })
    
    const softSkillsMatched = softSkillsMatchedLower.map(skill => {
        const original = jobKeywords.softSkills.find(s => s.toLowerCase().trim() === skill)
        return original || skill
    })
    
    console.log('✅ Hard skills matched:', hardSkillsMatched)
    console.log('💡 Soft skills matched:', softSkillsMatched)
    console.log('❌ Missing keywords:', missing)
    
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

// ADVANCED EDUCATION MATCHING SYSTEM
const EDUCATION_DATABASE = {
    // Degree levels with synonyms
    degreeTypes: {
        'phd': ['phd', 'ph.d', 'ph d', 'doctor of philosophy', 'doctorate', 'doctoral'],
        'masters': ['masters', 'master', "master's", 'msc', 'm.sc', 'ms', 'm.s', 'mba', 'm.b.a', 'ma', 'm.a', 'meng', 'm.eng'],
        'bachelors': ['bachelors', 'bachelor', "bachelor's", 'bsc', 'b.sc', 'bs', 'b.s', 'ba', 'b.a', 'beng', 'b.eng', 'btech', 'b.tech'],
        'associate': ['associate', 'associates', 'as', 'a.s', 'aa', 'a.a'],
        'diploma': ['diploma', 'certificate']
    },
    
    // Field synonyms - COMPREHENSIVE MATCHING
    fieldSynonyms: {
        // Computer Science family
        'computer_science': [
            'computer science', 'cs', 'cse', 'computer engineering',
            'computing', 'computational science', 'informatics',
            'computer systems', 'computing science'
        ],
        'software_engineering': [
            'software engineering', 'se', 'swe', 'software development',
            'software systems', 'computer software engineering'
        ],
        'information_technology': [
            'information technology', 'it', 'information systems',
            'management information systems', 'mis', 'information science',
            'computer information systems', 'cis'
        ],
        'data_science': [
            'data science', 'data analytics', 'data engineering',
            'big data', 'data analysis', 'analytics'
        ],
        'artificial_intelligence': [
            'artificial intelligence', 'ai', 'machine learning', 'ml',
            'deep learning', 'neural networks', 'cognitive science'
        ],
        'cybersecurity': [
            'cybersecurity', 'cyber security', 'information security',
            'network security', 'computer security', 'infosec'
        ],
        
        // Engineering fields
        'electrical_engineering': [
            'electrical engineering', 'ee', 'ece', 'electronics',
            'electronics and communication', 'electrical and electronics'
        ],
        'mechanical_engineering': [
            'mechanical engineering', 'me', 'mechanical', 'manufacturing engineering'
        ],
        
        // Business fields
        'business': [
            'business', 'business administration', 'management',
            'commerce', 'business management', 'bba', 'mba'
        ],
        
        // Science fields
        'mathematics': [
            'mathematics', 'math', 'maths', 'applied mathematics',
            'computational mathematics', 'statistics'
        ],
        'physics': ['physics', 'applied physics', 'physical science'],
        'chemistry': ['chemistry', 'chemical science']
    },
    
    // Related fields mapping (for "related field" requirements)
    relatedFields: {
        'computer_science': [
            'computer_science', 'software_engineering', 'information_technology',
            'data_science', 'artificial_intelligence', 'cybersecurity',
            'electrical_engineering', 'mathematics'
        ],
        'software_engineering': [
            'software_engineering', 'computer_science', 'information_technology',
            'computer_engineering'
        ],
        'data_science': [
            'data_science', 'computer_science', 'statistics', 'mathematics',
            'artificial_intelligence'
        ],
        'business': [
            'business', 'management', 'economics', 'finance', 'marketing'
        ]
    }
}

// Normalize education text to standard field
const normalizeEducationField = (text) => {
    const lowerText = text.toLowerCase().trim()
    
    for (const [standardField, synonyms] of Object.entries(EDUCATION_DATABASE.fieldSynonyms)) {
        for (const synonym of synonyms) {
            if (lowerText.includes(synonym)) {
                return standardField
            }
        }
    }
    
    return null
}

// Normalize degree level
const normalizeDegreeLevel = (text) => {
    const lowerText = text.toLowerCase().trim()
    
    for (const [level, synonyms] of Object.entries(EDUCATION_DATABASE.degreeTypes)) {
        for (const synonym of synonyms) {
            if (lowerText.includes(synonym)) {
                return level
            }
        }
    }
    
    return null
}

// Check if education matches job requirements
const matchEducation = (resume, jobDescription) => {
    const jobDescLower = jobDescription.toLowerCase()
    
    // 1. Extract required degree level
    let requiredDegreeLevel = null
    for (const [level, synonyms] of Object.entries(EDUCATION_DATABASE.degreeTypes)) {
        for (const synonym of synonyms) {
            if (jobDescLower.includes(synonym)) {
                requiredDegreeLevel = level
                break
            }
        }
        if (requiredDegreeLevel) break
    }
    
    // 2. Extract required field
    let requiredField = normalizeEducationField(jobDescription)
    
    // 3. Check for "any discipline"
    const acceptsAnyField = /any (discipline|field|major|degree)/i.test(jobDescription)
    
    // 4. Check candidate's education
    if (!resume.education || resume.education.length === 0) {
        return {
            hasEducation: false,
            degreeMatch: false,
            fieldMatch: false,
            score: 0
        }
    }
    
    let bestMatch = {
        hasEducation: true,
        degreeMatch: false,
        fieldMatch: false,
        score: 40  // Base score for having any education
    }
    
    for (const edu of resume.education) {
        const candidateDegree = normalizeDegreeLevel(edu.degree || '')
        const candidateField = normalizeEducationField((edu.field || '') + ' ' + (edu.degree || ''))
        
        // Degree level hierarchy: phd > masters > bachelors > associate > diploma
        const degreeHierarchy = { 'phd': 5, 'masters': 4, 'bachelors': 3, 'associate': 2, 'diploma': 1 }
        
        // Check degree match
        let degreeScore = 0
        if (candidateDegree && requiredDegreeLevel) {
            if (candidateDegree === requiredDegreeLevel) {
                degreeScore = 40  // Exact match
                bestMatch.degreeMatch = true
            } else if (degreeHierarchy[candidateDegree] > degreeHierarchy[requiredDegreeLevel]) {
                degreeScore = 40  // Higher degree is good
                bestMatch.degreeMatch = true
            } else {
                degreeScore = 20  // Lower degree
            }
        } else if (candidateDegree) {
            // Has a degree but job doesn't specify
            degreeScore = 30
        }
        
        // Check field match
        let fieldScore = 0
        if (acceptsAnyField) {
            // Job accepts any field
            fieldScore = 30
            bestMatch.fieldMatch = true
        } else if (candidateField && requiredField) {
            if (candidateField === requiredField) {
                // Exact field match
                fieldScore = 30
                bestMatch.fieldMatch = true
            } else if (EDUCATION_DATABASE.relatedFields[requiredField]?.includes(candidateField)) {
                // Related field match
                fieldScore = 25
                bestMatch.fieldMatch = true
            } else {
                // Unrelated field
                fieldScore = 10
            }
        } else if (candidateField) {
            // Has a field but job doesn't specify
            fieldScore = 20
        }
        
        const totalScore = Math.min(degreeScore + fieldScore, 100)
        
        if (totalScore > bestMatch.score) {
            bestMatch.score = totalScore
        }
    }
    
    console.log('Education Match:', bestMatch)
    
    return bestMatch
}

// STEP 3: Calculate section scores (ACCURATE MATCHING)
const calculateSectionScores = (resume, jobKeywords, matchResult, experienceYears, jobDescription) => {
    const scores = {}
    
    // 1. SKILLS SCORE - Based on hard skills match
    scores.skills = matchResult.hardSkillsScore
    
    // 2. EXPERIENCE SCORE - Years + keyword presence in descriptions
    let experienceScore = 0
    
    if (resume.experience?.length > 0) {
        // Years of experience component (50%)
        const yearsScore = experienceYears.required > 0
            ? Math.min((experienceYears.found / experienceYears.required) * 50, 50)
            : 25
        
        // Keyword presence in experience descriptions (50%)
        const expText = resume.experience.map(e => e.description || '').join(' ').toLowerCase()
        const jobKeywordsLower = jobKeywords.allKeywords.map(k => k.toLowerCase().trim())
        const expMatches = jobKeywordsLower.filter(kw => expText.includes(kw))
        const keywordScore = jobKeywordsLower.length > 0
            ? (expMatches.length / jobKeywordsLower.length) * 50
            : 25
        
        experienceScore = Math.round(yearsScore + keywordScore)
    } else {
        experienceScore = 0
    }
    
    scores.experience = Math.min(experienceScore, 100)
    
    // 3. EDUCATION SCORE - ADVANCED SEMANTIC MATCHING (case-insensitive)
    const educationMatch = matchEducation(resume, jobDescription)
    scores.education = educationMatch.score
    
    console.log('Section Scores (Skills + Experience + Education):', scores)
    
    return scores
}

// MAIN CONTROLLER: Analyze job match
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

        // STEP 3: Calculate section scores
        const sectionScores = calculateSectionScores(
            resume, 
            extracted.jobKeywords, 
            matchResult,
            extracted.experienceYears,
            jobDescription  // Pass full job description for education matching
        )

        // STEP 4: Calculate OVERALL ATS SCORE - Average of 3 Sections
        // ATS Score = (Skills + Experience + Education) / 3
        const atsScore = Math.round(
            (sectionScores.skills + sectionScores.experience + sectionScores.education) / 3
        )

        console.log('🎯 ATS Score Breakdown (3 sections):')
        console.log(`   Skills: ${sectionScores.skills}`)
        console.log(`   Experience: ${sectionScores.experience}`)
        console.log(`   Education: ${sectionScores.education}`)
        console.log(`   Average: (${sectionScores.skills} + ${sectionScores.experience} + ${sectionScores.education}) / 3 = ${atsScore}/100`)

        // STEP 5: Generate AI suggestions
        const systemPrompt = `You are an ATS resume optimizer. Provide actionable, specific suggestions based on the analysis.`
        const userPrompt = `
ATS Score: ${atsScore}/100
Section Scores:
- Skills: ${sectionScores.skills}/100
- Experience: ${sectionScores.experience}/100
- Education: ${sectionScores.education}/100

Matched Keywords: ${matchResult.matched.join(', ')}
Missing Keywords: ${matchResult.missing.join(', ')}

Hard Skills Score: ${matchResult.hardSkillsScore}%
Soft Skills Score: ${matchResult.softSkillsScore}%

Provide suggestions in JSON:
{
    "improvedSummary": "Write a better professional summary (2-3 sentences) that naturally includes 3-5 missing keywords",
    "skillsToAdd": ["skill1", "skill2", "skill3"],
    "experienceImprovements": ["tip1", "tip2"],
    "overallTips": ["tip1", "tip2", "tip3"]
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

        console.log('Analysis complete!')
        
        // STEP 7: Return clean response
        return res.status(200).json({
            analysisId: analysis._id,
            atsScore,
            matchRate: extracted.jobKeywords.allKeywords.length > 0 
                ? Math.round((matchResult.matched.length / extracted.jobKeywords.allKeywords.length) * 100)
                : 0,
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
        console.error('Analysis error:', error)
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