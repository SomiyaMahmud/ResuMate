import Job from "../models/Job.js"

// ==================== JOB POSTING CONTROLLERS ====================

// Create new job post
// POST: /api/jobs/create
export const createJob = async (req, res) => {
    try {
        const userId = req.userId
        const jobData = req.body

        const newJob = await Job.create({
            postedBy: userId,
            ...jobData
        })

        return res.status(201).json({
            message: "Job posted successfully",
            job: newJob
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get all jobs with filters
// GET: /api/jobs?jobType=Full-time&location=Dhaka&industry=Technology
export const getAllJobs = async (req, res) => {
    try {
        const {
            search,
            jobType,
            location,
            industry,
            category,
            workplaceType,
            experienceMin,
            experienceMax,
            status = 'Active',
            page = 1,
            limit = 20
        } = req.query

        // Build query
        let query = { status }

        // Text search
        if (search) {
            query.$text = { $search: search }
        }

        // Filters
        if (jobType) query.jobType = jobType
        if (location) query.location = { $regex: location, $options: 'i' }
        if (industry) query.industry = industry
        if (category) query.category = category
        if (workplaceType) query.workplaceType = workplaceType
        
        if (experienceMin) {
            query.experienceMin = { $lte: parseInt(experienceMin) }
        }
        if (experienceMax) {
            query.experienceMax = { $gte: parseInt(experienceMax) }
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await Job.countDocuments(query)

        return res.status(200).json({
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get single job by ID
// GET: /api/jobs/:jobId
export const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params

        const job = await Job.findById(jobId)
            .populate('postedBy', 'name email')

        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        // Increment views
        job.views += 1
        await job.save()

        return res.status(200).json({ job })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Update job
// PUT: /api/jobs/update/:jobId
export const updateJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const userId = req.userId
        const updates = req.body

        const job = await Job.findOne({ _id: jobId, postedBy: userId })

        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" })
        }

        Object.assign(job, updates)
        await job.save()

        return res.status(200).json({
            message: "Job updated successfully",
            job
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Delete job
// DELETE: /api/jobs/delete/:jobId
export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const userId = req.userId

        const job = await Job.findOneAndDelete({ _id: jobId, postedBy: userId })

        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" })
        }

        return res.status(200).json({ message: "Job deleted successfully" })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Save/Unsave job
// POST: /api/jobs/save/:jobId
export const toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const userId = req.userId

        const job = await Job.findById(jobId)

        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        const isSaved = job.savedBy.includes(userId)

        if (isSaved) {
            // Unsave
            job.savedBy = job.savedBy.filter(id => id.toString() !== userId)
        } else {
            // Save
            job.savedBy.push(userId)
        }

        await job.save()

        return res.status(200).json({
            message: isSaved ? "Job unsaved" : "Job saved",
            isSaved: !isSaved
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get user's saved jobs
// GET: /api/jobs/saved
export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.userId

        const jobs = await Job.find({ savedBy: userId, status: 'Active' })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get user's posted jobs
// GET: /api/jobs/my-posts
export const getMyJobs = async (req, res) => {
    try {
        const userId = req.userId

        const jobs = await Job.find({ postedBy: userId })
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}