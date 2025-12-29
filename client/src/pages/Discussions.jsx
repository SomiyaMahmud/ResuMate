import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import {
    MessageSquare, Search, Plus, Eye, MessageCircle,
    Bookmark, BookmarkCheck, Clock, X, Pin
} from 'lucide-react'
import FriendActionButton from '../components/community/FriendActionButton'

const Discussions = () => {
    const { language } = useLanguage()
    const t = (key) => getTranslation(language, key)
    const { token, user } = useSelector(state => state.auth)
    const navigate = useNavigate()

    const [discussions, setDiscussions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Create form
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        content: '',
        category: 'General Discussion',
        tags: ''
    })

    // Search only
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        'Resume Help',
        'Career Advice',
        'Interview Tips',
        'Job Search',
        'Salary Negotiation',
        'Skill Development',
        'Networking',
        'General Discussion',
        'Other'
    ]

    useEffect(() => {
        loadDiscussions()
    }, [searchQuery])

    const loadDiscussions = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)

            const { data } = await api.get(`/api/discussions?${params.toString()}`)
            setDiscussions(data.discussions)
        } catch (error) {
            console.error('Load discussions error:', error)
        }
        setLoading(false)
    }

    const handleCreateDiscussion = async (e) => {
        e.preventDefault()

        if (!token) {
            toast.error(t('pleaseLoginToComment'))
            return
        }

        if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
            toast.error(`${t('titleRequired')} ${t('and')} ${t('contentRequired')} ${t('required')}`)
            return
        }

        try {
            const { data } = await api.post('/api/discussions/create', {
                title: newDiscussion.title,
                content: newDiscussion.content,
                category: 'General Discussion',
                tags: newDiscussion.tags.split(',').map(t => t.trim()).filter(Boolean)
            }, {
                headers: { Authorization: token }
            })

            toast.success(t('discussionUpdated'))
            setShowCreateModal(false)
            setNewDiscussion({ title: '', content: '', tags: '' })
            navigate(`/app/discussions/${data.discussion._id}`)
        } catch (error) {
            toast.error(t('discussionUpdateError'))
        }
    }

    const handleSave = async (discussionId, e) => {
        e.stopPropagation()
        if (!token) {
            toast.error(t('pleaseLoginToSave'))
            return
        }

        try {
            const { data } = await api.post(`/api/discussions/${discussionId}/save`, {}, {
                headers: { Authorization: token }
            })
            toast.success(data.message)
        } catch (error) {
            toast.error(t('saveError'))
        }
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
            <div className='max-w-6xl mx-auto px-4 py-8'>

                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>
                            {t('communityDiscussionsTitle')}
                        </h1>
                        <p className='text-slate-600 dark:text-slate-400'>
                            {discussions.length} {t('discussions')}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg'
                    >
                        <Plus className='size-5' />
                        {t('newDiscussion')}
                    </button>
                </div>

                {/* Search Bar */}
                <div className='bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 mb-6'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400' />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchDiscussions')}
                            className='w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500'
                        />
                    </div>
                </div>

                {/* Discussions List */}
                {loading ? (
                    <div className='text-center py-12'>
                        <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto'></div>
                        <p className='mt-4 text-slate-600 dark:text-slate-400'>{t('loading')}</p>
                    </div>
                ) : discussions.length === 0 ? (
                    <div className='text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800'>
                        <MessageSquare className='size-16 mx-auto mb-4 text-slate-300 dark:text-slate-600' />
                        <p className='text-lg text-slate-600 dark:text-slate-400'>{t('noDiscussionsFound')}</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className='mt-4 text-indigo-600 dark:text-indigo-400 hover:underline'
                        >
                            {t('startNewDiscussion')}
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {discussions.map(discussion => (
                            <div
                                key={discussion._id}
                                onClick={() => navigate(`/app/discussions/${discussion._id}`)}
                                className='bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow cursor-pointer'
                            >
                                <div className='flex items-start gap-4'>
                                    {/* User Avatar */}
                                    <div className='size-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0'>
                                        {discussion.postedBy?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-start justify-between gap-4 mb-2'>
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    {discussion.isPinned && (
                                                        <Pin className='size-4 text-amber-600 dark:text-amber-400' />
                                                    )}
                                                    <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>
                                                        {discussion.title}
                                                    </h3>
                                                </div>
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
                                                            <span className='text-slate-500 dark:text-slate-500 italic'>
                                                                {t('edited')}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className='text-slate-600 dark:text-slate-400 mb-4 line-clamp-2'>
                                            {discussion.content}
                                        </p>

                                        {/* Tags */}
                                        <div className='flex flex-wrap items-center gap-2 mb-4'>
                                            <span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium'>
                                                {discussion.category}
                                            </span>
                                            {discussion.tags?.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className='px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm'
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className='flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400'>
                                            <span className='flex items-center gap-1'>
                                                <MessageCircle className='size-4' />
                                                {discussion.totalComments || discussion.comments?.length || 0} {t('comments')}
                                            </span>
                                            <span className='flex items-center gap-1'>
                                                <Eye className='size-4' />
                                                {discussion.views} {t('views')}
                                            </span>
                                            <button
                                                onClick={(e) => handleSave(discussion._id, e)}
                                                className='ml-auto hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors'
                                            >
                                                {discussion.savedBy?.includes(user?._id) ? (
                                                    <BookmarkCheck className='size-5 text-indigo-600 dark:text-indigo-400' />
                                                ) : (
                                                    <Bookmark className='size-5' />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Discussion Modal */}
                {showCreateModal && (
                    <div
                        onClick={() => setShowCreateModal(false)}
                        className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4'
                    >
                        <form
                            onClick={e => e.stopPropagation()}
                            onSubmit={handleCreateDiscussion}
                            className='bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto'
                        >
                            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-6'>
                                {t('startANewDiscussion')}
                            </h2>

                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                        {t('titleRequired')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscussion.title}
                                        onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                        placeholder={t('titleRequired')}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                        {t('contentRequired')} *
                                    </label>
                                    <textarea
                                        value={newDiscussion.content}
                                        onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                        placeholder={t('contentRequired')}
                                        rows={8}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 resize-none'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                                        {t('tagsCommaSeparated')}
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscussion.tags}
                                        onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                                        placeholder={t('tagsCommaSeparated')}
                                        className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100'
                                    />
                                </div>
                            </div>

                            <div className='flex gap-4 mt-6'>
                                <button
                                    type='button'
                                    onClick={() => setShowCreateModal(false)}
                                    className='flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors'
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type='submit'
                                    className='flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors'
                                >
                                    {t('postDiscussion')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Discussions