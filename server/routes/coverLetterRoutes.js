import express from "express";
import {
    createCoverLetter,
    getMyCoverLetters,
    getCoverLetterById,
    updateCoverLetter,
    deleteCoverLetter
} from "../controllers/coverLetterControllers.js";
import protect from "../middlewares/authMiddleware.js";

const coverLetterRouter = express.Router();

coverLetterRouter.post("/create", protect, createCoverLetter);
coverLetterRouter.get("/my", protect, getMyCoverLetters);
coverLetterRouter.get("/:id", protect, getCoverLetterById);
coverLetterRouter.put("/:id", protect, updateCoverLetter);
coverLetterRouter.delete("/:id", protect, deleteCoverLetter);

export default coverLetterRouter;
