import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume"
    },
    title: {
        type: String,
        default: "Untitled Cover Letter"
    },
    // Sender Info (Usually from User/Resume but editable)
    senderInfo: {
        name: String,
        email: String,
        phone: String,
        address: String,
        location: String,
        linkedin: String,
    },
    // Recipient Info
    recipientName: String,
    recipientRole: String,
    companyName: String,
    companyAddress: String,
    date: {
        type: Date,
        default: Date.now
    },
    // Content
    salutation: {
        type: String,
        default: "Dear Hiring Manager,"
    },
    content: {
        introduction: String,
        body: String,
        conclusion: String,
    },
    closing: {
        type: String,
        default: "Sincerely,"
    },
    accentColor: {
        type: String,
        default: "#3b82f6"
    },
    template: {
        type: String,
        default: "classic"
    }
}, { timestamps: true });

const CoverLetter = mongoose.model("CoverLetter", CoverLetterSchema);
export default CoverLetter;
