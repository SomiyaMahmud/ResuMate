import ResumeReview from "../models/ResumeReview.js";
import imagekit from "../configs/imagekit.js";
import fs from "fs";

export const submitReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, resumeId, tags } = req.body;
        const file = req.file;

        let externalPdfUrl = "";

        if (file) {
            const fileStream = fs.createReadStream(file.path);
            const uploadResponse = await imagekit.files.upload({
                file: fileStream,
                fileName: `resume_${userId}_${Date.now()}.pdf`,
                folder: "/resume-reviews/"
            });
            externalPdfUrl = uploadResponse.url;
            // Delete temp file
            fs.unlinkSync(file.path);
        }

        if (!resumeId && !externalPdfUrl) {
            return res.status(400).json({ message: "Please provide either a site resume or upload a PDF" });
        }

        const newReview = await ResumeReview.create({
            user: userId,
            title,
            description,
            resumeId: resumeId || null,
            externalPdfUrl,
            tags: tags ? JSON.parse(tags) : []
        });

        res.status(201).json({ message: "Resume submitted for review", review: newReview });
    } catch (error) {
        console.error("Submit Review Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const { search, tag, myReviews } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (tag) {
            query.tags = tag;
        }

        if (myReviews === 'true') {
            query.user = req.userId;
        }

        const reviews = await ResumeReview.find(query)
            .populate("user", "name email")
            .populate("resumeId", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await ResumeReview.findById(id)
            .populate("user", "name email")
            .populate("resumeId")
            .populate("comments.user", "name email");

        if (!review) {
            return res.status(404).json({ message: "Review request not found" });
        }

        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const voteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'upvote' or 'downvote'
        const userId = req.userId;

        const review = await ResumeReview.findById(id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (type === "upvote") {
            // Remove from downvotes if present
            review.downvotes = review.downvotes.filter(id => id.toString() !== userId);

            // Toggle upvote
            const index = review.upvotes.indexOf(userId);
            if (index === -1) {
                review.upvotes.push(userId);
            } else {
                review.upvotes.splice(index, 1);
            }
        } else if (type === "downvote") {
            // Remove from upvotes if present
            review.upvotes = review.upvotes.filter(id => id.toString() !== userId);

            // Toggle downvote
            const index = review.downvotes.indexOf(userId);
            if (index === -1) {
                review.downvotes.push(userId);
            } else {
                review.downvotes.splice(index, 1);
            }
        }

        await review.save();
        res.status(200).json({
            upvotes: review.upvotes.length,
            downvotes: review.downvotes.length,
            userUpvoted: review.upvotes.includes(userId),
            userDownvoted: review.downvotes.includes(userId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        const review = await ResumeReview.findById(id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.comments.push({
            user: userId,
            content
        });

        await review.save();

        const updatedReview = await ResumeReview.findById(id).populate("comments.user", "name email");
        res.status(201).json({ message: "Comment added", comments: updatedReview.comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const review = await ResumeReview.findById(id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await review.deleteOne();
        res.status(200).json({ message: "Review request deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
