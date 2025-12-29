import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'

import {
    ArrowLeft, Bookmark, BookmarkCheck, Eye, Clock,
    MessageCircle, Edit2, Trash2, Send, X, Check, Reply
} from 'lucide-react'
import FriendActionButton from '../components/community/FriendActionButton'

const DiscussionDetails = () => {
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)
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

    // Replies
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
            toast.error(t('discussionLoadError'))
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!token) {
            toast.error(t('pleaseLoginToSave'))
            return
        }

        try {
            const { data } = await api.post(`/api/discussions/${discussionId}/save`, {}, {
                headers: { Authorization: token }
            })
            setIsSaved(data.isSaved)
            toast.success(data.message)
        } catch (error) {
            toast.error(t('saveError'))
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!token) {
            toast.error(t('pleaseLoginToComment'))
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
            toast.success(t('commentAdded'))
        } catch (error) {
            toast.error(t('commentAddError'))
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
            toast.success(t('commentUpdated'))
        } catch (error) {
            toast.error(t('commentUpdateError'))
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm(t('deleteCommentConfirm'))) return

        try {
            const { data } = await api.delete(`/api/discussions/${discussionId}/comment/${commentId}`, {
                headers: { Authorization: token }
            })
            setDiscussion({ ...discussion, comments: data.comments })
            toast.success(t('commentDeleted'))
        } catch (error) {
            toast.error(t('commentDeleteError'))
        }
    }

    const handleAddReply = async (commentId, e) => {
        e.preventDefault()
        if (!token) {
            toast.error(t('pleaseLoginToReply'))
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
            toast.success(t('replyAdded'))
        } catch (error) {
            toast.error(t('replyAddError'))
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
            toast.success(t('replyUpdated'))
        } catch (error) {
            toast.error(t('replyUpdateError'))
        }
    }

    const handleDeleteReply = async (commentId, replyId) => {
        if (!window.confirm(t('deleteReplyConfirm'))) return

        try {
            const { data } = await api.delete(
                `/api/discussions/${discussionId}/comment/${commentId}/reply/${replyId}`,
                { headers: { Authorization: token } }
            )
            setDiscussion({ ...discussion, comments: data.comments })
            toast.success(t('replyDeleted'))
        } catch (error) {
            toast.error(t('replyDeleteError'))
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
            toast.success(t('discussionUpdated'))
        } catch (error) {
            toast.error(t('discussionUpdateError'))
        }
    }

    const handleDeleteDiscussion = async () => {
        if (!window.confirm(t('deleteDiscussionConfirm'))) return

        try {
            await api.delete(`/api/discussions/delete/${discussionId}`, {
                headers: { Authorization: token }
            })
            toast.success(t('discussionDeleted'))
            navigate('/app/discussions')
        } catch (error) {
            toast.error(t('discussionDeleteError'))
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
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>{t('discussionNotFound')}</h2>
                    <button onClick={() => navigate('/app/discussions')} className='text-indigo-600 hover:underline'>
                        {t('backToDiscussions')}
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
                    {t('backToDiscussions')}
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
                                                <FriendActionButton
                                                    userId={discussion.postedBy?._id}
                                                    userName={discussion.postedBy?.name}
                                                />
                                                <span>•</span>
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='size-3' />
                                                    {new Date(discussion.createdAt).toLocaleDateString()}
                                                </span>
                                                {discussion.isEdited && (
                                                    <>
                                                        <span>•</span>
                                                        <span className='italic text-slate-500'>{t('edited')}</span>
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
                                        {discussion.totalComments || discussion.comments?.length || 0} {t('comments')}
                                    </span>
                                    <span className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                                        <Eye className='size-5' />
                                        {discussion.views} {t('views')}
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
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type='submit'
                                        className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2'
                                    >
                                        <Check className='size-4' />
                                        {t('saveChanges')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8'>
                    <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>
                        {t('comments')} ({discussion.comments?.length || 0})
                    </h2>

                    {/* Add Comment */}
                    {token ? (
                        <form onSubmit={handleAddComment} className='mb-8'>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('addComment')}
                                rows={4}
                                className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none mb-3'
                            />
                            <button
                                type='submit'
                                disabled={!newComment.trim()}
                                className='px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors'
                            >
                                <Send className='size-4' />
                                {t('postComment')}
                            </button>
                        </form>
                    ) : (
                        <div className='mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center'>
                            <p className='text-slate-600 dark:text-slate-400'>
                                {t('pleaseLoginToComment')}
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
                                                    <FriendActionButton
                                                        userId={comment.user?._id}
                                                        userName={comment.user?.name}
                                                    />
                                                    <span className='text-slate-500 dark:text-slate-400'>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {comment.isEdited && (
                                                        <span className='text-slate-500 dark:text-slate-400 italic'>
                                                            ({t('edited')})
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
                                                            {t('cancel')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditComment(comment._id)}
                                                            className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm'
                                                        >
                                                            {t('save')}
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
                                            {t('reply')}
                                        </button>

                                        {/* Reply Form */}
                                        {replyingToCommentId === comment._id && (
                                            <form onSubmit={(e) => handleAddReply(comment._id, e)} className='mt-3 ml-8'>
                                                <textarea
                                                    value={newReply}
                                                    onChange={(e) => setNewReply(e.target.value)}
                                                    placeholder={t('writeReply')}
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
                                                        {t('cancel')}
                                                    </button>
                                                    <button
                                                        type='submit'
                                                        disabled={!newReply.trim()}
                                                        className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded text-sm'
                                                    >
                                                        {t('postReply')}
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
                                                                        <FriendActionButton
                                                                            userId={reply.user?._id}
                                                                            userName={reply.user?.name}
                                                                        />
                                                                        <span className='text-slate-500 dark:text-slate-400'>
                                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        {reply.isEdited && (
                                                                            <span className='text-slate-500 dark:text-slate-400 italic'>
                                                                                ({t('edited')})
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
                                                                                {t('cancel')}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEditReply(comment._id, reply._id)}
                                                                                className='px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs'
                                                                            >
                                                                                {t('save')}
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
                                {t('noCommentsYet')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiscussionDetails