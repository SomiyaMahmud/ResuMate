import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    User as UserIcon,
    Clock,
    FileText,
    ExternalLink,
    Send,
    Trash2,
    Calendar,
    ChevronDown,
    ChevronUp,
    MoreHorizontal
} from 'lucide-react';
import ResumePreview from '../components/ResumePreview';

const ResumeReviewDetails = () => {
    const { id } = useParams();
    const { token, user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        loadReview();
    }, [id]);

    const loadReview = async () => {
        try {
            const { data } = await api.get(`/api/resume-reviews/${id}`);
            setReview(data.review);
        } catch (error) {
            console.error('Load review error:', error);
            toast.error('Failed to load review details');
        }
        setLoading(false);
    };

    const handleVote = async (type) => {
        if (!token) {
            toast.error('Please login to vote');
            return;
        }
        setVoting(true);
        try {
            const { data } = await api.post(`/api/resume-reviews/${id}/vote`, { type }, {
                headers: { Authorization: token }
            });
            setReview({
                ...review,
                upvotes: new Array(data.upvotes).fill(0), // Dummy data structure update
                downvotes: new Array(data.downvotes).fill(0)
            });
            // Better refresh
            loadReview();
        } catch (error) {
            toast.error('Failed to vote');
        } finally {
            setVoting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        if (!token) {
            toast.error('Please login to comment');
            return;
        }

        setSubmittingComment(true);
        try {
            const { data } = await api.post(`/api/resume-reviews/${id}/comment`, { content: comment }, {
                headers: { Authorization: token }
            });
            setReview({ ...review, comments: data.comments });
            setComment('');
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this review request?')) return;
        try {
            await api.delete(`/api/resume-reviews/${id}`, {
                headers: { Authorization: token }
            });
            toast.success('Deleted successfully');
            navigate('/app/resume-reviews');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!review) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Review request not found</h2>
            <button onClick={() => navigate('/app/resume-reviews')} className="mt-4 text-indigo-600 hover:underline">
                Back to all reviews
            </button>
        </div>
    );

    const isMe = user && review.user?._id === user?._id;
    const hasUpvoted = user && review.upvotes?.includes(user?._id);
    const hasDownvoted = user && review.downvotes?.includes(user?._id);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left side: Resume Preview & Info */}
                <div className="flex-1 space-y-6">
                    <button
                        onClick={() => navigate('/app/resume-reviews')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Reviews
                    </button>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">{review.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                                        <div className="size-7 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
                                            <UserIcon className="size-4" />
                                        </div>
                                        {review.user?.name || 'Unknown User'}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-4" />
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {isMe && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete submission"
                                >
                                    <Trash2 className="size-5" />
                                </button>
                            )}
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{review.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {review.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Resume View Section */}
                        <div className="mt-10 border-t border-slate-100 dark:border-slate-800 pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="size-6 text-indigo-600" />
                                    Resume Preview
                                </h2>
                                {review.externalPdfUrl && (
                                    <a
                                        href={review.externalPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                                    >
                                        <ExternalLink className="size-4" />
                                        Open PDF
                                    </a>
                                )}
                            </div>

                            {review.externalPdfUrl ? (
                                <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center group relative border-2 border-slate-200 dark:border-slate-800">
                                    <iframe
                                        src={`${review.externalPdfUrl}#toolbar=0`}
                                        className="w-full h-full border-none"
                                        title="Resume PDF"
                                    ></iframe>
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={review.externalPdfUrl} target="_blank" className="px-6 py-2 bg-white text-black font-bold rounded-full shadow-lg">Download to View Full</a>
                                    </div>
                                </div>
                            ) : review.resumeId ? (
                                <div className="max-h-[800px] overflow-y-auto rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950 p-4 custom-scrollbar">
                                    <div className="max-w-[800px] mx-auto scale-[0.9] origin-top md:scale-[0.95] lg:scale-100 transition-transform">
                                        <ResumePreview
                                            data={review.resumeId}
                                            template={review.resumeId.template}
                                            accentColor={review.resumeId.accent_color}
                                            sectionOrder={review.resumeId.sectionOrder}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl text-center border border-red-200 dark:border-red-900/20">Resume content not available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Votes & Comments */}
                <div className="lg:w-96 space-y-6">
                    {/* Votes Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Community Feedback</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleVote('upvote')}
                                disabled={voting}
                                className={`flex flex-col items-center gap-2 p-6 rounded-2xl transition-all border-2 ${hasUpvoted ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-emerald-200'}`}
                            >
                                <ThumbsUp className={`size-8 ${hasUpvoted ? 'fill-emerald-500' : ''}`} />
                                <span className="text-xl font-black">{review.upvotes.length}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Upvotes</span>
                            </button>

                            <button
                                onClick={() => handleVote('downvote')}
                                disabled={voting}
                                className={`flex flex-col items-center gap-2 p-6 rounded-2xl transition-all border-2 ${hasDownvoted ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-indigo-200'}`}
                            >
                                <ThumbsDown className={`size-8 ${hasDownvoted ? 'fill-indigo-500' : ''}`} />
                                <span className="text-xl font-black">{review.downvotes.length}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Downvotes</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <MessageCircle className="size-5 text-indigo-600" />
                            Reviewer Comments ({review.comments.length})
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                            {review.comments.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm">No comments yet. Help this user out!</p>
                                </div>
                            ) : (
                                review.comments.map((comment, idx) => (
                                    <div key={comment._id || idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="size-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                                                {comment.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{comment.user?.name || 'Unknown User'}</p>
                                            <span className="text-[10px] text-slate-400 ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a review..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                                rows={2}
                            ></textarea>
                            <button
                                type="submit"
                                disabled={!comment.trim() || submittingComment}
                                className="absolute right-3 top-1/2 -translate-y-1/2 size-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-all shadow-md"
                            >
                                <Send className="size-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeReviewDetails;
