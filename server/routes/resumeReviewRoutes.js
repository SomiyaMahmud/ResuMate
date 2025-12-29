import express from "express";
import {
    submitReview,
    getAllReviews,
    getReviewById,
    voteReview,
    addComment,
    deleteReview
} from "../controllers/resumeReviewControllers.js";
import protect from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const resumeReviewRouter = express.Router();

resumeReviewRouter.post("/submit", protect, upload.single("pdf"), submitReview);
resumeReviewRouter.get("/all", getAllReviews);
resumeReviewRouter.get("/:id", getReviewById);
resumeReviewRouter.post("/:id/vote", protect, voteReview);
resumeReviewRouter.post("/:id/comment", protect, addComment);
resumeReviewRouter.delete("/:id", protect, deleteReview);

export default resumeReviewRouter;
