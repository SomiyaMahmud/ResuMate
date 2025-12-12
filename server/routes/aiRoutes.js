import express from "express"
import protect from "../middlewares/authMiddleware.js"
import { 
    enhanceJobDescription, 
    enhanceProfessionalSummary, 
    uploadResume,
    analyzeJobMatch,
    applySuggestions,
    getAnalysisHistory
} from "../controllers/aiController.js"

const aiRouter = express.Router()

// Existing routes
aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription)
aiRouter.post('/upload-resume', protect, uploadResume)

// NEW ATS Analysis routes
aiRouter.post('/analyze-job-match', protect, analyzeJobMatch)
aiRouter.post('/apply-suggestions', protect, applySuggestions)
aiRouter.get('/analysis-history/:resumeId', protect, getAnalysisHistory)

export default aiRouter