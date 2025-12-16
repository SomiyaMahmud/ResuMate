import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Bookmark, BookmarkCheck, Eye, Clock,
    MessageCircle, Edit2, Trash2, Send, X, Check, Reply
} from 'lucide-react'

const DiscussionDetails = () => {
    const { discussionId } = useParams()
    const { token, user } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const [discussion, setDiscussion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    
    // Comments
    const [newComment, setNewComment] = useState('')
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editCommentText, setEditCommentText] = useState('')
    
    // Replies - NEW
    const [replyingToCommentId, setReplyingToCommentId] = useState(null)
    const [newReply, setNewReply] = useState('')
    const [editingReplyId, setEditingReplyId] = useState(null)
    const [editReplyText, setEditReplyText] = useState('')
    
    // Edit discussion
    const [isEditingDiscussion, setIsEditingDiscussion] = useState(false)
    const [editedDiscussion, setEditedDiscussion] = useState({
        title: '',
        content: ''
    })

    useEffect(() => {
        loadDiscussion()
    }, [discussionId])

    const loadDiscussion = async () => {
        try {
            const { data } = await api.get(`/api/discussions/${discussionId}`)
            setDiscussion(data.discussion)
            setIsSaved(data.discussion.savedBy?.includes(user?._id))
            setEditedDiscussion({
                title: data.discussion.title,
                content: data.discussion.content
            })
        } catch (error) {
            toast.error('Failed to load discussion')
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!token) {
            toast.error('Please login to save')
            return
        }

        try {
            const { data } = await api.post(`/api/discussions/${discussionId}/save`, {}, {
                headers: { Authorization: token }
            })
            setIsSaved(data.isSaved)
            toast.success(data.message)
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!token) {
            toast.error('Please login to comment')
            return
        }

        if (!newComment.trim()) return

        try {
            const { data } = await api.post(`/api/discussions/${discussionId}/comment`, {
                content: newComment
            }, {
                headers: { Authorization: token }
            })
            setDiscussion({ ...discussion, comments: data.comments })
            setNewComment('')
            toast.success('Comment added!')
        } catch (error) {
            toast.error('Failed to add comment')
        }
    }

    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return

        try {
            const { data } = await api.put(`/api/discussions/${discussionId}/comment/${commentId}`, {
                content: editCommentText
            }, {
                headers: { Authorization: token }
            })
            setDiscussion({ ...discussion, comments: data.comments })
            setEditingCommentId(null)
            toast.success('Comment updated!')
        } catch (error) {
            toast.error('Failed to update comment')
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return

        try {
            const { data } = await api.delete(`/api/discussions/${discussionId}/comment/${commentId}`, {
                headers: { Authorization: token }
            })
            setDiscussion({ ...discussion, comments: data.comments })
            toast.success('Comment deleted!')
        } catch (error) {
            toast.error('Failed to delete comment')
        }
    }

    // NEW: Reply handlers
    const handleAddReply = async (commentId, e) => {
        e.preventDefault()
        if (!token) {
            toast.error('Please login to reply')
            return
        }

        if (!newReply.trim()) return

        try {
            const { data } = await api.post(
                `/api/discussions/${discussionId}/comment/${commentId}/reply`,
                { content: newReply },
                { headers: { Authorization: token } }
            )
            setDiscussion({ ...discussion, comments: data.comments })
            setNewReply('')
            setReplyingToCommentId(null)
            toast.success('Reply added!')
        } catch (error) {
            toast.error('Failed to add reply')
        }
    }

    const handleEditReply = async (commentId, replyId) => {
        if (!editReplyText.trim()) return

        try {
            const { data } = await api.put(
                `/api/discussions/${discussionId}/comment/${commentId}/reply/${replyId}`,
                { content: editReplyText },
                { headers: { Authorization: token } }
            )
            setDiscussion({ ...discussion, comments: data.comments })
            setEditingReplyId(null)
            toast.success('Reply updated!')
        } catch (error) {
            toast.error('Failed to update reply')
        }
    }

    const handleDeleteReply = async (commentId, replyId) => {
        if (!window.confirm('Delete this reply?')) return

        try {
            const { data } = await api.delete(
                `/api/discussions/${discussionId}/comment/${commentId}/reply/${replyId}`,
                { headers: { Authorization: token } }
            )
            setDiscussion({ ...discussion, comments: data.comments })
            toast.success('Reply deleted!')
        } catch (error) {
            toast.error('Failed to delete reply')
        }
    }

    const handleUpdateDiscussion = async (e) => {
        e.preventDefault()

        try {
            const { data } = await api.put(`/api/discussions/update/${discussionId}`, editedDiscussion, {
                headers: { Authorization: token }
            })
            setDiscussion(data.discussion)
            setIsEditingDiscussion(false)
            toast.success('Discussion updated!')
        } catch (error) {
            toast.error('Failed to update discussion')
        }
    }

    const handleDeleteDiscussion = async () => {
        if (!window.confirm('Are you sure you want to delete this discussion?')) return

        try {
            await api.delete(`/api/discussions/delete/${discussionId}`, {
                headers: { Authorization: token }
            })
            toast.success('Discussion deleted!')
            navigate('/app/discussions')
        } catch (error) {
            toast.error('Failed to delete discussion')
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            </div>
        )
    }

    if (!discussion) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Discussion not found</h2>
                    <button onClick={() => navigate('/app/discussions')} className='text-indigo-600 hover:underline'>
                        Back to discussions
                    </button>
                </div>
            </div>
        )
    }

    const isAuthor = discussion.postedBy?._id === user?._id

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-4xl mx-auto px-4 py-8'>
                
                {/* Back Button */}
                <button
                    onClick={() => navigate('/app/discussions')}
                    className='flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6'
                >
                    <ArrowLeft className='size-5' />
                    Back to Discussions
                </button>

                {/* Main Discussion */}
                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6'>
                    <div className='p-8'>
                        {!isEditingDiscussion ? (
                            <>
                                <div className='flex items-start justify-between mb-4'>
                                    <div className='flex items-start gap-4 flex-1'>
                                        <div className='size-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0'>
                                            {discussion.postedBy?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className='flex-1'>
                                            <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>
                                                {discussion.title}
                                            </h1>
                                            <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                                                <span className='font-medium'>{discussion.postedBy?.name}</span>
                                                <span>•</span>
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='size-3' />
                                                    {new Date(discussion.createdAt).toLocaleDateString()}
                                                </span>
                                                {discussion.isEdited && (
                                                    <>
                                                        <span>•</span>
                                                        <span className='italic text-slate-500'>Edited</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isAuthor && (
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => setIsEditingDiscussion(true)}
                                                className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                                            >
                                                <Edit2 className='size-5 text-slate-600 dark:text-slate-400' />
                                            </button>
                                            <button
                                                onClick={handleDeleteDiscussion}
                                                className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                            >
                                                <Trash2 className='size-5 text-red-600 dark:text-red-400' />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className='flex flex-wrap gap-2 mb-6'>
                                    <span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium'>
                                        {discussion.category}
                                    </span>
                                    {discussion.tags?.map((tag, i) => (
                                        <span key={i} className='px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm'>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className='prose dark:prose-invert max-w-none mb-6'>
                                    <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                        {discussion.content}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className='flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-slate-700'>
                                    <span className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                                        <MessageCircle className='size-5' />
                                        {discussion.totalComments || discussion.comments?.length || 0} comments
                                    </span>
                                    <span className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                                        <Eye className='size-5' />
                                        {discussion.views} views
                                    </span>
                                    <button
                                        onClick={handleSave}
                                        className='ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
                                    >
                                        {isSaved ? (
                                            <BookmarkCheck className='size-6 text-indigo-600 dark:text-indigo-400' />
                                        ) : (
                                            <Bookmark className='size-6 text-slate-400' />
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleUpdateDiscussion} className='space-y-4'>
                                <input
                                    type="text"
                                    value={editedDiscussion.title}
                                    onChange={(e) => setEditedDiscussion({ ...editedDiscussion, title: e.target.value })}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-2xl font-bold'
                                    required
                                />
                                <textarea
                                    value={editedDiscussion.content}
                                    onChange={(e) => setEditedDiscussion({ ...editedDiscussion, content: e.target.value })}
                                    rows={10}
                                    className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                                    required
                                />
                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => setIsEditingDiscussion(false)}
                                        className='px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg flex items-center gap-2'
                                    >
                                        <X className='size-4' />
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2'
                                    >
                                        <Check className='size-4' />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>
                        Comments ({discussion.comments?.length || 0})
                    </h2>

                    {/* Add Comment */}
                    {token ? (
                        <form onSubmit={handleAddComment} className='mb-8'>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder='Add a comment...'
                                rows={4}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none mb-3'
                            />
                            <button
                                type='submit'
                                disabled={!newComment.trim()}
                                className='px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors'
                            >
                                <Send className='size-4' />
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <div className='mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center'>
                            <p className='text-slate-600 dark:text-slate-400'>
                                Please login to comment
                            </p>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className='space-y-6'>
                        {discussion.comments?.map(comment => (
                            <div key={comment._id} className='space-y-4'>
                                {/* Comment */}
                                <div className='flex gap-4'>
                                    <div className='size-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0'>
                                        {comment.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className='flex-1'>
                                        <div className='bg-slate-50 dark:bg-slate-800 rounded-lg p-4'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <div className='flex items-center gap-2 text-sm'>
                                                    <span className='font-semibold text-slate-900 dark:text-white'>
                                                        {comment.user?.name}
                                                    </span>
                                                    <span className='text-slate-500 dark:text-slate-400'>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {comment.isEdited && (
                                                        <span className='text-slate-500 dark:text-slate-400 italic'>
                                                            (edited)
                                                        </span>
                                                    )}
                                                </div>
                                                {comment.user?._id === user?._id && (
                                                    <div className='flex gap-1'>
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(comment._id)
                                                                setEditCommentText(comment.content)
                                                            }}
                                                            className='p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded'
                                                        >
                                                            <Edit2 className='size-4 text-slate-600 dark:text-slate-400' />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className='p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded'
                                                        >
                                                            <Trash2 className='size-4 text-red-600 dark:text-red-400' />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {editingCommentId === comment._id ? (
                                                <div className='space-y-2'>
                                                    <textarea
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        rows={3}
                                                        className='w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                                                    />
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => setEditingCommentId(null)}
                                                            className='px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded text-sm'
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditComment(comment._id)}
                                                            className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm'
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                                    {comment.content}
                                                </p>
                                            )}
                                        </div>

                                        {/* Reply Button */}
                                        <button
                                            onClick={() => setReplyingToCommentId(comment._id)}
                                            className='mt-2 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        >
                                            <Reply className='size-4' />
                                            Reply
                                        </button>

                                        {/* Reply Form */}
                                        {replyingToCommentId === comment._id && (
                                            <form onSubmit={(e) => handleAddReply(comment._id, e)} className='mt-3 ml-8'>
                                                <textarea
                                                    value={newReply}
                                                    onChange={(e) => setNewReply(e.target.value)}
                                                    placeholder='Write a reply...'
                                                    rows={3}
                                                    className='w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none mb-2'
                                                />
                                                <div className='flex gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setReplyingToCommentId(null)
                                                            setNewReply('')
                                                        }}
                                                        className='px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded text-sm'
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type='submit'
                                                        disabled={!newReply.trim()}
                                                        className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded text-sm'
                                                    >
                                                        Post Reply
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Replies List */}
                                        {comment.replies?.length > 0 && (
                                            <div className='mt-4 ml-8 space-y-3'>
                                                {comment.replies.map(reply => (
                                                    <div key={reply._id} className='flex gap-3'>
                                                        <div className='size-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0'>
                                                            {reply.user?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className='flex-1'>
                                                            <div className='bg-slate-100 dark:bg-slate-800 rounded-lg p-3'>
                                                                <div className='flex items-center justify-between mb-1'>
                                                                    <div className='flex items-center gap-2 text-xs'>
                                                                        <span className='font-semibold text-slate-900 dark:text-white'>
                                                                            {reply.user?.name}
                                                                        </span>
                                                                        <span className='text-slate-500 dark:text-slate-400'>
                                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        {reply.isEdited && (
                                                                            <span className='text-slate-500 dark:text-slate-400 italic'>
                                                                                (edited)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {reply.user?._id === user?._id && (
                                                                        <div className='flex gap-1'>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingReplyId(reply._id)
                                                                                    setEditReplyText(reply.content)
                                                                                }}
                                                                                className='p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded'
                                                                            >
                                                                                <Edit2 className='size-3 text-slate-600 dark:text-slate-400' />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteReply(comment._id, reply._id)}
                                                                                className='p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded'
                                                                            >
                                                                                <Trash2 className='size-3 text-red-600 dark:text-red-400' />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {editingReplyId === reply._id ? (
                                                                    <div className='space-y-2'>
                                                                        <textarea
                                                                            value={editReplyText}
                                                                            onChange={(e) => setEditReplyText(e.target.value)}
                                                                            rows={2}
                                                                            className='w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm resize-none'
                                                                        />
                                                                        <div className='flex gap-2'>
                                                                            <button
                                                                                onClick={() => setEditingReplyId(null)}
                                                                                className='px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded text-xs'
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEditReply(comment._id, reply._id)}
                                                                                className='px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs'
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className='text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                                                                        {reply.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {discussion.comments?.length === 0 && (
                            <div className='text-center py-8 text-slate-500 dark:text-slate-400'>
                                No comments yet. Be the first to comment!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiscussionDetails