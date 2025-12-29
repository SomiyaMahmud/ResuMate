import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);
export default Message;
