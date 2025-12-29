import CoverLetter from "../models/CoverLetter.js";

export const createCoverLetter = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, title, senderInfo } = req.body;

        const newCL = await CoverLetter.create({
            userId,
            resumeId: resumeId || null,
            title: title || "New Cover Letter",
            senderInfo
        });

        res.status(201).json({ message: "Cover letter created", coverLetter: newCL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyCoverLetters = async (req, res) => {
    try {
        const userId = req.userId;
        const cls = await CoverLetter.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json({ coverLetters: cls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCoverLetterById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const cl = await CoverLetter.findOne({ userId, _id: id });
        if (!cl) return res.status(404).json({ message: "Cover letter not found" });
        res.status(200).json({ coverLetter: cl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCoverLetter = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const updateData = req.body;

        const cl = await CoverLetter.findOneAndUpdate(
            { userId, _id: id },
            updateData,
            { new: true }
        );

        if (!cl) return res.status(404).json({ message: "Cover letter not found" });
        res.status(200).json({ message: "Updated successfully", coverLetter: cl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCoverLetter = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const cl = await CoverLetter.findOneAndDelete({ userId, _id: id });
        if (!cl) return res.status(404).json({ message: "Cover letter not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
