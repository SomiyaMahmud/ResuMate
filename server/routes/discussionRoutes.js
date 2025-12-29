// routes/discussionRoutes.js
import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import {
    createDiscussion,
    getAllDiscussions,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    addComment,
    editComment,
    deleteComment,
    addReply,
    editReply,
    deleteReply,
    toggleSaveDiscussion,
    getSavedDiscussions,
    getMyDiscussions
} from '../controllers/discussionControllers.js'

const discussionRouter = express.Router()

// Discussion CRUD
discussionRouter.post('/create', protect, createDiscussion)
discussionRouter.get('/', getAllDiscussions)  // Public
discussionRouter.get('/saved', protect, getSavedDiscussions)
discussionRouter.get('/my-posts', protect, getMyDiscussions)
discussionRouter.get('/:discussionId', getDiscussionById)
discussionRouter.put('/update/:discussionId', protect, updateDiscussion)
discussionRouter.delete('/delete/:discussionId', protect, deleteDiscussion)

// Comments
discussionRouter.post('/:discussionId/comment', protect, addComment)
discussionRouter.put('/:discussionId/comment/:commentId', protect, editComment)
discussionRouter.delete('/:discussionId/comment/:commentId', protect, deleteComment)

// Replies
discussionRouter.post('/:discussionId/comment/:commentId/reply', protect, addReply)
discussionRouter.put('/:discussionId/comment/:commentId/reply/:replyId', protect, editReply)
discussionRouter.delete('/:discussionId/comment/:commentId/reply/:replyId', protect, deleteReply)

// Engagement
discussionRouter.post('/:discussionId/save', protect, toggleSaveDiscussion)

export default discussionRouter