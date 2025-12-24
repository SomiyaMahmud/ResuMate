import express from 'express'
import cors from 'cors'
import "dotenv/config"
import connectDb from './configs/db.js'
import userRouter from './routes/userRoutes.js'
import resumeRouter from './routes/resumeRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import plannerRouter from './routes/plannerRoutes.js'

const app =express()
const PORT = process.env.PORT || 3000

// Connect with Database
await connectDb()

app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>res.send("Server is Live...."))
app.use('/api/users',userRouter)
app.use('/api/resumes',resumeRouter)
app.use('/api/ai',aiRouter)
app.use('/api/planner',plannerRouter)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})