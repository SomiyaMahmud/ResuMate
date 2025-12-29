import mongoose from "mongoose";

const connectDb = async () =>{
    try {
        mongoose.connection.on("connected", ()=>{console.log("Database Connected Successfully")})

        let mongodbURI = process.env.MONGODB_URI
        const projectName = 'resume-builder'

        if(!mongodbURI){
            throw new Error("MONGODB_URI environment variable is not set")
        }

        if (mongodbURI.endsWith('/')){
            mongodbURI = mongodbURI.slice(0,-1)
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`)
    } catch (error) {
        console.log("Error connecting to MongoDb: ", error);
    }
}

export default connectDb;