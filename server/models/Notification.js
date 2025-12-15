import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ['comment', 'reply', 'mention'],
        required: true
    },
    discussionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discussion",
        required: true
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Index for faster queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', NotificationSchema)

export default Notification