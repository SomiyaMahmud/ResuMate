import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

const SubmitResumeReview = () => {
    const { token, user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [myResumes, setMyResumes] = useState([]);
    const [loadingResumes, setLoadingResumes] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        resumeId: '',
        tags: []
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [submissionType, setSubmissionType] = useState('internal'); // 'internal' or 'upload'

    const availableTags = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'Entry Level', 'Senior', 'Product Manager', 'Designer'];

    useEffect(() => {
        if (!token) {
            toast.error('Please login to submit a review request');
            navigate('/login');
            return;
        }
        fetchMyResumes();
    }, [token]);

    const fetchMyResumes = async () => {
        setLoadingResumes(true);
        try {
            const timestamp = new Date().getTime();
            const { data } = await api.get(`/api/users/resumes?t=${timestamp}`, {
                headers: { Authorization: token }
            });
            setMyResumes(data.resumes || []);
        } catch (error) {
            console.error('Fetch resumes error:', error);
            toast.error('Failed to load your resumes');
        }
        setLoadingResumes(false);
    };

    const toggleTag = (tag) => {
        setForm(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            toast.error('Title and description are required');
            return;
        }

        if (submissionType === 'internal' && !form.resumeId) {
            toast.error('Please select a resume from your list');
            return;
        }

        if (submissionType === 'upload' && !pdfFile) {
            toast.error('Please upload a PDF file');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('tags', JSON.stringify(form.tags));

            if (submissionType === 'internal') {
                formData.append('resumeId', form.resumeId);
            } else {
                formData.append('pdf', pdfFile);
            }

            await api.post('/api/resume-reviews/submit', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Resume submitted for review!');
            navigate('/app/resume-reviews');
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="size-4" />
                Back to Reviews
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Your Resume</h1>
                    <p className="text-slate-500 dark:text-slate-400">Choose how you want to share your resume for community feedback</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Request Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g., Software Engineer Intern Resume - Need feedback on projects"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">How can reviewers help you?</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Tell reviewers what you're looking for. Be specific about your concerns."
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Select Resume Source</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSubmissionType('internal')}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${submissionType === 'internal' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                            >
                                <div className={`size-10 rounded-full flex items-center justify-center ${submissionType === 'internal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Built on Site</p>
                                    <p className="text-xs text-slate-500">Select from your saved resumes</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSubmissionType('upload')}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${submissionType === 'upload' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                            >
                                <div className={`size-10 rounded-full flex items-center justify-center ${submissionType === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Upload className="size-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Upload PDF</p>
                                    <p className="text-xs text-slate-500">Upload your own file</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {submissionType === 'internal' ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            {loadingResumes ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-6 text-indigo-600 animate-spin" />
                                </div>
                            ) : myResumes.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-slate-500 text-sm mb-4">You haven't built any resumes on this site yet.</p>
                                    <button
                                        type="button"
                                        onClick={() => setSubmissionType('upload')}
                                        className="text-indigo-600 font-bold hover:underline"
                                    >
                                        Upload a PDF instead
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {myResumes.map(resume => (
                                        <label key={resume._id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.resumeId === resume._id ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="resumeSelect"
                                                    checked={form.resumeId === resume._id}
                                                    onChange={() => setForm({ ...form, resumeId: resume._id })}
                                                    className="size-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="font-medium text-slate-900 dark:text-white">{resume.title}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">
                                                Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${pdfFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPdfFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {pdfFile ? (
                                    <div className="space-y-2">
                                        <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                                        <p className="font-bold text-slate-900 dark:text-white">{pdfFile.name}</p>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="size-10 text-slate-400 mx-auto" />
                                        <p className="font-medium text-slate-900 dark:text-white">Click to upload or drag & drop</p>
                                        <p className="text-xs text-slate-500">PDF files only (max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Tags (optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.tags.includes(tag) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Submitting Request...
                                </>
                            ) : (
                                "Launch Review Request"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitResumeReview;
