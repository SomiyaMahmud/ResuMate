import mongoose from "mongoose";

const JobAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Resume",
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        default: "Untitled Position"
    },
    company: {
        type: String,
        default: ""
    },
    
    // Main Scores
    atsScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    
    // Keywords
    matchedKeywords: [{type: String}],
    missingKeywords: [{type: String}],
    
    // Skills Breakdown
    hardSkillsScore: {type: Number, default: 0},
    softSkillsScore: {type: Number, default: 0},
    hardSkillsMatched: [{type: String}],
    softSkillsMatched: [{type: String}],
    
    // Section Scores
    sectionScores: {
        summary: {type: Number, default: 0},
        skills: {type: Number, default: 0},
        experience: {type: Number, default: 0},
        education: {type: Number, default: 0}
    },
    
    // Experience & Education Match
    experienceMatch: {
        required: {type: Number, default: null},
        found: {type: Number, default: null}
    },
    educationMatch: {
        required: {type: String, default: null},
        found: {type: String, default: null}
    },
    
    // AI Suggestions
    suggestions: {
        improvedSummary: {type: String},
        skillsToAdd: [{type: String}],
        experienceImprovements: [{type: String}],
        overallTips: [{type: String}]
    }
}, { timestamps: true })

// Index for faster queries
JobAnalysisSchema.index({ userId: 1, resumeId: 1, createdAt: -1 })

const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema)

export default JobAnalysis