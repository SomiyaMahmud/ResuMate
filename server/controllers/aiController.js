import Resume from "../models/Resume.js"
import ai from "../configs/ai.js"
import axios from 'axios'
import * as cheerio from 'cheerio'

// Controller for enhancing a resume professional summary
// POST: /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req,res) => {
    try {
        const {userContent} = req.body
        if(!userContent){
            return res.state(400).json({message: "Missing Requires Field"})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL, 
            messages: [
                { role: "system", content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-3 sentences also highlights the key skills, experience and career objectives. Make it compelling and ATS-friendly and only retun text no option or anything else." },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choice[0].message.content
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// Controller for enhancing a resume job description
// POST: /api/ai/enhance-job-desc

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
                {
                    role: "user",
                    content: userContent,
                },
            ],
        })

        const enhancedContent = response.choice[0].message.content
        return res.status(200).json({enhancedContent})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// Controller for uploading a resume to the database
// POST: /api/ai/upload-resume


export const uploadResume = async (req,res) => {
    try {
        const {resumeText,title} = req.body
        const userId = req.userId
        if(!resumeText){
            return res.state(400).json({message: "Missing Requires Field"})
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
        }
        `
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL, 
            messages: [
                { role: "system", 
                content: systemPrompt },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format:{type: 'json_object'}
        })

        const extractedData = response.choice[0].message.content
        const parseData = JSON.parse(extractedData)
        const newResume = await Resume.create({userId,title,...parseData})

        res.json({resumeId: newResume._id})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// Controller for importing data from LinkedIn
// POST: /api/ai/import-linkedin

export const importFromLinkedIn = async (req, res) => {
    try {
        const { profileText } = req.body
        if (!profileText) {
            return res.status(400).json({ message: "Missing required field: profileText" })
        }

        // Use AI to extract and structure the data from the pasted profile text
        const systemPrompt = `You are an expert AI agent that extracts professional information from LinkedIn profile text and converts it into structured resume format. Extract all available information including name, headline/profession, location, experience (with company, position, dates, description), education (institution, degree, field, dates), skills, and any projects or certifications. Be intelligent about parsing the text - it may be copied directly from LinkedIn with various formatting.`
        
        const userPrompt = `Extract professional information from this LinkedIn profile content and provide it in the following JSON format with no additional text before or after:
        {
            "professional_summary": "A brief professional summary based on the headline and about section",
            "skills": ["skill1", "skill2"],
            "personal_info": {
                "full_name": "Full Name",
                "profession": "Current Position/Headline",
                "email": "",
                "phone": "",
                "location": "City, Country",
                "linkedin": "extract linkedin url if present",
                "website": ""
            },
            "experience": [
                {
                    "company": "Company Name",
                    "position": "Job Title",
                    "start_date": "Month Year",
                    "end_date": "Month Year or Present",
                    "description": "Job description",
                    "is_current": true/false
                }
            ],
            "project": [
                {
                    "name": "Project Name",
                    "type": "Project Type",
                    "description": "Description"
                }
            ],
            "education": [
                {
                    "institution": "University Name",
                    "degree": "Degree",
                    "field": "Field of Study",
                    "graduation_date": "Year",
                    "gpa": ""
                }
            ]
        }

        LinkedIn profile content:
        ${profileText.substring(0, 15000)}`

        const aiResponse = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        })

        const extractedData = aiResponse.choices[0].message.content
        const resumeData = JSON.parse(extractedData)

        console.log('Successfully extracted LinkedIn data:', resumeData.personal_info?.full_name)

        return res.status(200).json({ resumeData })
    } catch (error) {
        console.error('LinkedIn import error:', error)
        return res.status(400).json({ 
            message: "Failed to process LinkedIn data",
            error: error.message 
        })
    }
}