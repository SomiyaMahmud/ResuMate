import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import {
    Search,
    Plus,
    MessageCircle,
    ThumbsUp,
    ThumbsDown,
    Clock,
    User as UserIcon,
    FileText,
    ExternalLink,
    Trophy
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

const ResumeReviews = () => {
    const { token, user } = useSelector(state => state.auth);
    const { language } = useLanguage();
    const t = (key) => getTranslation(language, key);
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    const tags = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Entry Level', 'Senior', 'Product Manager', 'Designer'];

    useEffect(() => {
        loadReviews();
    }, [searchQuery, selectedTag]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedTag) params.append('tag', selectedTag);

            const { data } = await api.get(`/api/resume-reviews/all?${params.toString()}`);
            // Filter out reviews where user is null (deleted users or bad data)
            const validReviews = data.reviews.filter(review => review.user);
            setReviews(validReviews);
        } catch (error) {
            console.error('Load reviews error:', error);
            toast.error(t('failedToLoadReviews'));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('resumeReviews')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('getFeedbackOnResume')}</p>
                </div>
                <Link
                    to="/app/resume-reviews/submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus className="size-5" />
                    {t('submitResume')}
                </Link>
            </div>

            {/* Leaderboard Section */}
            {reviews.some(r => r.upvotes?.length > 0) && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Trophy className="size-6 text-amber-500" />
                        {t('topRatedResumes')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sort by upvotes and take top 3 */}
                        {[...reviews].filter(r => r.upvotes?.length > 0).sort((a, b) => b.upvotes.length - a.upvotes.length).slice(0, 3).map((review, index) => (
                            <div
                                key={review._id}
                                onClick={() => navigate(`/app/resume-reviews/${review._id}`)}
                                className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all cursor-pointer hover:shadow-xl flex flex-col
                                    ${index === 0 ? 'border-amber-400 shadow-amber-100 dark:shadow-none ring-1 ring-amber-400' : ''}
                                    ${index === 1 ? 'border-slate-300 shadow-slate-100 dark:shadow-none ring-1 ring-slate-300' : ''}
                                    ${index === 2 ? 'border-orange-300 shadow-orange-100 dark:shadow-none ring-1 ring-orange-300' : ''}
                                `}
                            >
                                {/* Rank Badge */}
                                <div className={`absolute -top-4 -right-2 size-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg transform rotate-12
                                    ${index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white' : ''}
                                    ${index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' : ''}
                                    ${index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' : ''}
                                `}>
                                    #{index + 1}
                                </div>

                                <div className="flex gap-2 mb-4 flex-wrap pr-8">
                                    {review.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">{review.title}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                        <UserIcon className="size-3" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{review.user?.name}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                                        <ThumbsUp className="size-4 fill-amber-500" />
                                        <span>{review.upvotes.length} {t('upvotes')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                        <MessageCircle className="size-3" />
                                        <span>{review.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchByTitleOrDescription')}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    <button
                        onClick={() => setSelectedTag('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${!selectedTag ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                    >
                        {t('all')}
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedTag === tag ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Review List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-6"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="size-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('noReviewsFound')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {t('beFirstToSubmit')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map(review => (
                        <div
                            key={review._id}
                            onClick={() => navigate(`/app/resume-reviews/${review._id}`)}
                            className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl cursor-pointer flex flex-col h-full"
                        >
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {review.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{review.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-1">{review.description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                        <UserIcon className="size-4" />
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-semibold text-slate-900 dark:text-white">{review.user?.name || 'Unknown User'}</p>
                                        <p className="text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="size-4" />
                                        <span className="text-xs font-medium">{review.upvotes.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="size-4" />
                                        <span className="text-xs font-medium">{review.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResumeReviews;
