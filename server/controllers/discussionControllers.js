import Discussion from "../models/Discussion.js"
import Notification from "../models/Notification.js"

// ==================== DISCUSSION CONTROLLERS ====================

// Create new discussion
// POST: /api/discussions/create
export const createDiscussion = async (req, res) => {
    try {
        const userId = req.userId
        const { title, content, category, tags } = req.body

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" })
        }

        const newDiscussion = await Discussion.create({
            postedBy: userId,
            title,
            content,
            category,
            tags: tags || []
        })

        await newDiscussion.populate('postedBy', 'name email')

        return res.status(201).json({
            message: "Discussion created successfully",
            discussion: newDiscussion
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get all discussions with filters
// GET: /api/discussions?category=Resume Help&search=interview
export const getAllDiscussions = async (req, res) => {
    try {
        const {
            search,
            category,
            tags,
            page = 1,
            limit = 20
        } = req.query

        let query = {}

        // Text search
        if (search) {
            query.$text = { $search: search }
        }

        // Filters
        if (category) query.category = category
        if (tags) query.tags = { $in: tags.split(',') }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const discussions = await Discussion.find(query)
            .populate('postedBy', 'name email')
            .populate('comments.user', 'name email')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await Discussion.countDocuments(query)

        return res.status(200).json({
            discussions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get single discussion by ID
// GET: /api/discussions/:discussionId
export const getDiscussionById = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.userId // From auth middleware

        const discussion = await Discussion.findById(discussionId)
            .populate('postedBy', 'name email')
            .populate('comments.user', 'name email')

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        // Increment views only if user hasn't viewed before
        if (userId && !discussion.viewedBy.includes(userId)) {
            discussion.views += 1
            discussion.viewedBy.push(userId)
            await discussion.save()
        } else if (!userId) {
            // For non-logged-in users, still increment (optional)
            discussion.views += 1
            await discussion.save()
        }

        return res.status(200).json({ discussion })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Update discussion
// PUT: /api/discussions/update/:discussionId
export const updateDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.userId
        const { title, content, category, tags } = req.body

        const discussion = await Discussion.findOne({
            _id: discussionId,
            postedBy: userId
        })

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found or unauthorized" })
        }

        // Update fields
        if (title) discussion.title = title
        if (content) discussion.content = content
        if (category) discussion.category = category
        if (tags) discussion.tags = tags

        discussion.isEdited = true
        discussion.editedAt = new Date()

        await discussion.save()
        await discussion.populate('postedBy', 'name email')

        return res.status(200).json({
            message: "Discussion updated successfully",
            discussion
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Delete discussion
// DELETE: /api/discussions/delete/:discussionId
export const deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.userId

        const discussion = await Discussion.findOneAndDelete({
            _id: discussionId,
            postedBy: userId
        })

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found or unauthorized" })
        }

        return res.status(200).json({ message: "Discussion deleted successfully" })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, discussionId, commentId, message) => {
    try {
        // Don't notify if sender and recipient are the same
        if (recipientId.toString() === senderId.toString()) {
            return null
        }

        const notification = await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type,
            discussionId,
            commentId,
            message
        })

        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}








// ==================== COMMENT CONTROLLERS ====================



// Add comment
// POST: /api/discussions/:discussionId/comment
export const addComment = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.userId
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" })
        }

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        discussion.comments.push({
            user: userId,
            content: content.trim()
        })

        await discussion.save()
        await discussion.populate('comments.user', 'name email')

        // CREATE NOTIFICATION
        console.log('Creating notification for discussion author:', discussion.postedBy)
        await createNotification(
            discussion.postedBy,
            userId,
            'comment',
            discussionId,
            null,
            'commented on your discussion'
        )

        return res.status(200).json({
            message: "Comment added successfully",
            comments: discussion.comments
        })
    } catch (error) {
        console.error('Add comment error:', error)
        return res.status(400).json({ message: error.message })
    }
}



// Edit comment
// PUT: /api/discussions/:discussionId/comment/:commentId
export const editComment = async (req, res) => {
    try {
        const { discussionId, commentId } = req.params
        const userId = req.userId
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" })
        }

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const comment = discussion.comments.id(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        // Check if user owns the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        comment.content = content.trim()
        comment.isEdited = true
        comment.editedAt = new Date()

        await discussion.save()
        await discussion.populate('comments.user', 'name email')

        return res.status(200).json({
            message: "Comment updated successfully",
            comments: discussion.comments
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Delete comment
// DELETE: /api/discussions/:discussionId/comment/:commentId
export const deleteComment = async (req, res) => {
    try {
        const { discussionId, commentId } = req.params
        const userId = req.userId

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const comment = discussion.comments.id(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        // Check if user owns the comment
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        comment.deleteOne()
        await discussion.save()

        return res.status(200).json({
            message: "Comment deleted successfully",
            comments: discussion.comments
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}



// Save/Unsave discussion
// POST: /api/discussions/:discussionId/save
export const toggleSaveDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.userId

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const isSaved = discussion.savedBy.includes(userId)

        if (isSaved) {
            // Unsave
            discussion.savedBy = discussion.savedBy.filter(id => id.toString() !== userId)
        } else {
            // Save
            discussion.savedBy.push(userId)
        }

        await discussion.save()

        return res.status(200).json({
            message: isSaved ? "Discussion unsaved" : "Discussion saved",
            isSaved: !isSaved
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get user's saved discussions
// GET: /api/discussions/saved
export const getSavedDiscussions = async (req, res) => {
    try {
        const userId = req.userId

        const discussions = await Discussion.find({ savedBy: userId })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({ discussions })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Get user's discussions
// GET: /api/discussions/my-posts
export const getMyDiscussions = async (req, res) => {
    try {
        const userId = req.userId

        const discussions = await Discussion.find({ postedBy: userId })
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({ discussions })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


// Add reply to comment
// POST: /api/discussions/:discussionId/comment/:commentId/reply
export const addReply = async (req, res) => {
    try {
        const { discussionId, commentId } = req.params
        const userId = req.userId
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Reply content is required" })
        }

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const comment = discussion.comments.id(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        comment.replies.push({
            user: userId,
            content: content.trim()
        })

        await discussion.save()
        await discussion.populate('comments.user', 'name email')
        await discussion.populate('comments.replies.user', 'name email')

        // CREATE NOTIFICATION
        console.log('Creating notification for comment author:', comment.user)
        await createNotification(
            comment.user,
            userId,
            'reply',
            discussionId,
            commentId,
            'replied to your comment'
        )

        return res.status(200).json({
            message: "Reply added successfully",
            comments: discussion.comments
        })
    } catch (error) {
        console.error('Add reply error:', error)
        return res.status(400).json({ message: error.message })
    }
}


// Edit reply
// PUT: /api/discussions/:discussionId/comment/:commentId/reply/:replyId
export const editReply = async (req, res) => {
    try {
        const { discussionId, commentId, replyId } = req.params
        const userId = req.userId
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Reply content is required" })
        }

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const comment = discussion.comments.id(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const reply = comment.replies.id(replyId)

        if (!reply) {
            return res.status(404).json({ message: "Reply not found" })
        }

        // Check if user owns the reply
        if (reply.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        reply.content = content.trim()
        reply.isEdited = true
        reply.editedAt = new Date()

        await discussion.save()
        await discussion.populate('comments.user', 'name email')
        await discussion.populate('comments.replies.user', 'name email')

        return res.status(200).json({
            message: "Reply updated successfully",
            comments: discussion.comments
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Delete reply
// DELETE: /api/discussions/:discussionId/comment/:commentId/reply/:replyId
export const deleteReply = async (req, res) => {
    try {
        const { discussionId, commentId, replyId } = req.params
        const userId = req.userId

        const discussion = await Discussion.findById(discussionId)

        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" })
        }

        const comment = discussion.comments.id(commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const reply = comment.replies.id(replyId)

        if (!reply) {
            return res.status(404).json({ message: "Reply not found" })
        }

        // Check if user owns the reply
        if (reply.user.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        reply.deleteOne()
        await discussion.save()

        return res.status(200).json({
            message: "Reply deleted successfully",
            comments: discussion.comments
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}





















