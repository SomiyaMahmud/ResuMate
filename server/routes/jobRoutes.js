import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    toggleSaveJob,
    getSavedJobs,
    getMyJobs
} from '../controllers/jobControllers.js'

const jobRouter = express.Router()

// Job CRUD
jobRouter.post('/create', protect, createJob)
jobRouter.get('/', getAllJobs)  // Public - with filters
jobRouter.get('/saved', protect, getSavedJobs)
jobRouter.get('/my-posts', protect, getMyJobs)
jobRouter.get('/:jobId', getJobById)  // Public
jobRouter.put('/update/:jobId', protect, updateJob)
jobRouter.delete('/delete/:jobId', protect, deleteJob)

// Save/Unsave
jobRouter.post('/save/:jobId', protect, toggleSaveJob)

export default jobRouter