import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    responsibilities: {
        type: String,
        default: ""
    },
    benefits: {
        type: String,
        default: ""
    },

    
    
    // Job Details
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    workplaceType: {
        type: String,
        enum: ['On-site', 'Remote', 'Hybrid'],
        default: 'On-site'
    },
    
    // Categories
    industry: {
        type: String,
        required: true,
        enum: [
            'Technology',
            'Finance',
            'Healthcare',
            'Education',
            'Marketing',
            'Sales',
            'Design',
            'Engineering',
            'Human Resources',
            'Operations',
            'Other'
        ]
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Software Development',
            'Data Science',
            'Product Management',
            'Design',
            'Marketing',
            'Sales',
            'Customer Support',
            'Operations',
            'Finance',
            'Human Resources',
            'Other'
        ]
    },
    
    // Salary
    salaryMin: {
        type: Number,
        default: null
    },
    salaryMax: {
        type: Number,
        default: null
    },
    salaryCurrency: {
        type: String,
        default: 'BDT'
    },
    salaryPeriod: {
        type: String,
        enum: ['Hourly', 'Monthly', 'Yearly'],
        default: 'Monthly'
    },
    
    // Experience & Education
    experienceMin: {
        type: Number,
        default: 0
    },
    experienceMax: {
        type: Number,
        default: null
    },
    educationLevel: {
        type: String,
        enum: ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Any'],
        default: 'Bachelor'
    },
    
    // Application
    applicationDeadline: {
        type: Date,
        default: null
    },
    applicationEmail: {
        type: String,
        default: ""
    },
    applicationUrl: {
        type: String,
        default: ""
    },
    
    // Skills
    skills: [{
        type: String
    }],
    
    // Status
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Draft'],
        default: 'Active'
    },
    
    // Engagement
    views: {
        type: Number,
        default: 0
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })

// Indexes for search optimization
JobSchema.index({ title: 'text', company: 'text', description: 'text' })
JobSchema.index({ jobType: 1, location: 1, industry: 1, category: 1 })
JobSchema.index({ status: 1, createdAt: -1 })

const Job = mongoose.model('Job', JobSchema)
export default Job