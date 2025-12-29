import InterviewPlan from "../models/InterviewPlan.js";
import User from "../models/User.js";
import { sendInterviewAddedEmail, sendInterviewDeletedEmail } from "../configs/email.js";

// Create a new interview plan
export const createPlan = async (req, res) => {
    try {
        const { date, companyName, position, time, location, notes } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        if (!date || !companyName || !position || !time) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newPlan = new InterviewPlan({
            userId,
            date,
            companyName,
            position,
            time,
            location,
            notes
        });

        await newPlan.save();
        
        // Send email notification
        const user = await User.findById(userId);
        if (user && user.email) {
            await sendInterviewAddedEmail(user.email, {
                companyName,
                position,
                date,
                time,
                location,
                notes
            });
        }
        
        res.status(201).json({ success: true, plan: newPlan });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all plans for a user
export const getAllPlans = async (req, res) => {
    try {
        const userId = req.userId;
        const plans = await InterviewPlan.find({ userId }).sort({ date: 1 });
        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get plans for a specific month
export const getPlansByMonth = async (req, res) => {
    try {
        const userId = req.userId;
        const { year, month } = req.params;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const plans = await InterviewPlan.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.status(200).json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a plan
export const updatePlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { planId } = req.params;
        const updates = req.body;

        const plan = await InterviewPlan.findOne({ _id: planId, userId });
        
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        Object.keys(updates).forEach(key => {
            plan[key] = updates[key];
        });

        await plan.save();
        res.status(200).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a plan
export const deletePlan = async (req, res) => {
    try {
        const userId = req.userId;
        const { planId } = req.params;

        const plan = await InterviewPlan.findOneAndDelete({ _id: planId, userId });
        
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        
        // Send email notification
        const user = await User.findById(userId);
        if (user && user.email) {
            await sendInterviewDeletedEmail(user.email, {
                companyName: plan.companyName,
                position: plan.position,
                date: plan.date,
                time: plan.time
            });
        }

        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
