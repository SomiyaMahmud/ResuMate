import express from 'express'
import cors from 'cors'
import "dotenv/config"
import connectDb from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import resumeRouter from './routes/resumeRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import jobRouter from './routes/jobRoutes.js'
import discussionRouter from './routes/discussionRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import plannerRouter from './routes/plannerRoutes.js'
import friendRouter from './routes/friendRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import resumeReviewRouter from './routes/resumeReviewRoutes.js'
import coverLetterRouter from './routes/coverLetterRoutes.js'



const app = express()
const PORT = process.env.PORT || 3000

// Connect with Database
await connectDb()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => res.send("Server is Live...."))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)
app.use('/api/jobs', jobRouter)
app.use('/api/discussions', discussionRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/planner', plannerRouter)
app.use('/api/friends', friendRouter)
app.use('/api/chat', chatRouter)
app.use('/api/resume-reviews', resumeReviewRouter)
app.use('/api/cover-letters', coverLetterRouter)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})