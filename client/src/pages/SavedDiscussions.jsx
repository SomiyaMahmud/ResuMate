import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { Bookmark, MessageCircle, Eye, Clock, BookmarkX } from 'lucide-react'

const SavedDiscussions = () => {
    const { token } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const [savedDiscussions, setSavedDiscussions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSavedDiscussions()
    }, [])

    const loadSavedDiscussions = async () => {
        try {
            const { data } = await api.get('/api/discussions/saved', {
                headers: { Authorization: token }
            })
            setSavedDiscussions(data.discussions)
        } catch (error) {
            toast.error('Failed to load saved discussions')
        }
        setLoading(false)
    }

    const handleUnsave = async (discussionId) => {
        try {
            await api.post(`/api/discussions/${discussionId}/save`, {}, {
                headers: { Authorization: token }
            })
            setSavedDiscussions(savedDiscussions.filter(d => d._id !== discussionId))
            toast.success('Discussion removed from saved')
        } catch (error) {
            toast.error('Failed to remove discussion')
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
                <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-6xl mx-auto px-4 py-8'>
                <div className='flex items-center gap-3 mb-8'>
                    <Bookmark className='size-8 text-indigo-600 dark:text-indigo-400' />
                    <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                        Saved Discussions
                    </h1>
                </div>

                {savedDiscussions.length === 0 ? (
                    <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <Bookmark className='size-16 mx-auto mb-4 text-slate-300 dark:text-slate-600' />
                        <p className='text-lg text-slate-600 dark:text-slate-400 mb-4'>No saved discussions yet</p>
                        <button
                            onClick={() => navigate('/app/discussions')}
                            className='text-indigo-600 dark:text-indigo-400 hover:underline'
                        >
                            Browse discussions
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {savedDiscussions.map(discussion => (
                            <div
                                key={discussion._id}
                                className='bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow'
                            >
                                <div className='flex items-start gap-4'>
                                    <div className='size-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0'>
                                        {discussion.postedBy?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div
                                        onClick={() => navigate(`/app/discussions/${discussion._id}`)}
                                        className='flex-1 cursor-pointer'
                                    >
                                        <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-1'>
                                            {discussion.title}
                                        </h3>
                                        <p className='text-slate-600 dark:text-slate-400 mb-3 line-clamp-2'>
                                            {discussion.content}
                                        </p>
                                        <div className='flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400'>
                                            <span className='flex items-center gap-1'>
                                                <MessageCircle className='size-4' />
                                                {discussion.comments?.length || 0}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Eye className='size-4' />
                                                {discussion.views}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Clock className='size-4' />
                                                {new Date(discussion.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnsave(discussion._id)}
                                        className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                    >
                                        <BookmarkX className='size-6 text-red-600 dark:text-red-400' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedDiscussions