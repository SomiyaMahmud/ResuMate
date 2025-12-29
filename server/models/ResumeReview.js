import mongoose from "mongoose";

const ResumeReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume"
    },
    externalPdfUrl: {
        type: String
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    }
}, { timestamps: true });

const ResumeReview = mongoose.model("ResumeReview", ResumeReviewSchema);
export default ResumeReview;
