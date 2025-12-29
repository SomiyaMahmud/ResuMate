import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";


const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10d' })
    return token
}

// controllers for registration
//POST: /api/users/register

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the fields are present or not
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        // Check email already exist
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'User Already Exists' })
        }

        // create new user
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name, email, password: hashedPassword
        })

        //Return message
        const token = generateToken(newUser._id)
        newUser.password = undefined
        return res.status(201).json({ message: 'User created Successfully', token, user: newUser })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controllers for login
//POST: /api/users/login 

export const loginrUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user already exist
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password' })
        }

        //Check the password
        if (!user.comparePassword(password)) {
            return res.status(400).json({ message: 'Invalid Email or Password' })
        }

        // Return Success Message
        const token = generateToken(user._id)
        user.password = undefined
        return res.status(200).json({ message: 'Login Successfully', token, user })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controllers for getting user by id
//GET: /api/users/data

export const getUserById = async (req, res) => {
    try {
        const userId = req.query.userId || req.userId;

        // Check user already exist
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' })
        }


        // Return User
        user.password = undefined
        // If it's not the owner, hide private fields
        if (userId !== req.userId) {
            user.friends = undefined;
        }
        return res.status(200).json({ user })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controllers for getting user resumes
//GET: /api/users/resumes

export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;

        // Return User Resume
        const resumes = await Resume.find({ userId })
        return res.status(200).json({ resumes })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
} 