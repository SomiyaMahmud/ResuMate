import imagekit from "../configs/imagekit.js";
import Resume from "../models/Resume.js";
import fs from 'fs'

// controllers for creating new resumes
//POST: /api/resumes/create

export const createResume = async (req,res)=>{
    try {
        const userId = req.userId;
        const {title} = req.body;

        // Create New Resume
        const newResume = await Resume.create({userId,title})
        return res.status(201).json({message: "Resume Created Successfully",resume: newResume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controllers for deleting a  resumes
//DELETE: /api/resumes/delete

export const deleteResume = async (req,res)=>{
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

        await Resume.findOneAndDelete({userId,_id:resumeId})

        // Return Success Message
        return res.status(200).json({message: "Resume Deleted Successfully"})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// controllers for getiing resume by id
//GET: /api/resumes/get
export const getResumeById = async (req,res)=>{
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

        const resume = await Resume.findOne({userId,_id:resumeId})
        if(!resume){
            return res.status(404).json({message: "Resume Not Found"})
        }


        resume.__v = undefined
        resume.createdAt = undefined
        resume.updatedAt = undefined

        // Return Success Message 
        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// controllers for getiing resume by id in public
//GET: /api/resumes/public

export const getPublicResumeById = async (req,res)=>{
    try {
        const {resumeId} = req.params;

        const resume = await Resume.findOne({public:true, _id:resumeId})

        if(!resume){
            return res.status(404).json({message: "Resume Not Found"})
        }

        // Return Success Message 
        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// controllers for updating a resume 
//PUT: /api/resumes/update

export const updateResume = async (req,res)=>{
    try {
        const userId = req.userId
        const {resumeId,resumeData,removeBackground} = req.body;
        const image = req.file;

        let resumeDataCopy
        if (typeof resumeData == 'string'){
            resumeDataCopy = await JSON.parse(resumeData)
        } else{
            resumeDataCopy = structuredClone(resumeData)
        }

        if(image){
            const imagebufferData = fs.createReadStream(image.path)

            const response = await imagekit.files.upload({
                file: imagebufferData,
                fileName: 'resume.png',
                folder: 'user-resumes',
                transformation: {
                    pre: 'w-300,h-300,fo-face,z-0.75' + 
                    (removeBackground? 'e-bgremove' : "")
                }
              });
            
            resumeDataCopy.personal_info.image = response.url 
        }

        const resume = await Resume.findByIdAndUpdate({userId, _id:resumeId},resumeDataCopy, {new:true})
        return res.status(200).json({message: "Saved Successfully",resume})


    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}
