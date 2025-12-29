import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume, updateSectionOrder } from '../controllers/resumeControllers.js'
import upload from '../configs/multer.js'

const resumeRouter = express.Router()

resumeRouter.post('/create',protect, createResume)
resumeRouter.put('/update',upload.single('image'), protect, updateResume)
resumeRouter.delete('/delete/:resumeId',protect, deleteResume)
resumeRouter.get('/get/:resumeId',protect, getResumeById)
resumeRouter.get('/public/:resumeId', getPublicResumeById)
resumeRouter.put('/update-order', protect, updateSectionOrder) 


export default resumeRouter 