import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    // NEW: Add replies to comments
    replies: [ReplySchema]
}, { timestamps: true })

const DiscussionSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'Resume Help',
            'Career Advice',
            'Interview Tips',
            'Job Search',
            'Salary Negotiation',
            'Skill Development',
            'Networking',
            'General Discussion',
            'Other'
        ],
        default: 'General Discussion'
    },

    tags: [{
        type: String
    }],

    // Track unique viewers
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    
    // Engagement
    comments: [CommentSchema],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    views: {
        type: Number,
        default: 0
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    
    // Status
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    isPinned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

DiscussionSchema.index({ title: 'text', content: 'text' })
DiscussionSchema.index({ category: 1, createdAt: -1 })
DiscussionSchema.index({ isPinned: -1, createdAt: -1 })

const Discussion = mongoose.model('Discussion', DiscussionSchema)
export default Discussion