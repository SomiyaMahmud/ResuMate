import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    ArrowLeft,
    Save,
    Download,
    Layout,
    Type,
    User,
    Building,
    FileText,
    Loader2,
    Sparkles
} from 'lucide-react';
import api from '../configs/api.js';
import toast from 'react-hot-toast';
import CoverLetterPreview from '../components/CoverLetterPreview';

const CoverLetterBuilder = () => {
    const { clId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector(state => state.auth);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [clData, setClData] = useState({
        title: '',
        senderInfo: { name: '', email: '', phone: '', location: '', profession: '', linkedin: '' },
        recipientName: '',
        recipientRole: '',
        companyName: '',
        companyAddress: '',
        salutation: 'Dear Hiring Manager,',
        content: { introduction: '', body: '', conclusion: '' },
        closing: 'Sincerely,',
        accentColor: '#4f46e5'
    });

    const [activeTab, setActiveTab] = useState('sender'); // sender, recipient, content, design

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resumeId = params.get('resumeId');

        if (clId && clId !== 'new') {
            loadCoverLetter();
        } else if (resumeId) {
            prefillFromResume(resumeId);
        } else {
            setLoading(false);
        }
    }, [clId]);

    const prefillFromResume = async (resumeId) => {
        try {
            const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
                headers: { Authorization: token }
            });
            if (data.resume) {
                const info = data.resume.personal_info || {};
                setClData(prev => ({
                    ...prev,
                    resumeId: resumeId,
                    senderInfo: {
                        name: info.full_name || '',
                        email: info.email || '',
                        phone: info.phone || '',
                        location: info.location || '',
                        profession: info.profession || '',
                        linkedin: info.linkedin || ''
                    }
                }));
            }
        } catch (error) {
            console.error("Prefill error:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCoverLetter = async () => {
        try {
            const { data } = await api.get(`/api/cover-letters/${clId}`, {
                headers: { Authorization: token }
            });
            setClData(data.coverLetter);
        } catch (error) {
            toast.error("Failed to load cover letter");
            navigate('/app/my-resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (clId === 'new') {
                const { data } = await api.post('/api/cover-letters/create', clData, {
                    headers: { Authorization: token }
                });
                navigate(`/app/cover-letter/builder/${data.coverLetter._id}`, { replace: true });
                toast.success("Created successfully");
            } else {
                await api.put(`/api/cover-letters/${clId}`, clData, {
                    headers: { Authorization: token }
                });
                toast.success("Saved successfully");
            }
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const downloadAsPdf = () => {
        window.print();
        setShowDownloadMenu(false);
    };

    const generateAIContent = async () => {
        toast.loading("Generating content...");
        // This is a placeholder for AI generation logic
        // In a real app, you'd call an AI endpoint
        setTimeout(() => {
            setClData(prev => ({
                ...prev,
                content: {
                    introduction: "I am writing to express my strong interest in the [Role] position at [Company]. With my background in [Field] and passion for [Industry], I am confident that I can make a significant contribution to your team.",
                    body: "Throughout my career, I have demonstrated a strong ability to [Skill 1] and [Skill 2]. At my previous role, I successfully [Achievement], which resulted in [Outcome]. I am particularly impressed by [Company]'s commitment to [Value], and I am eager to bring my expertise to help you achieve your goals.",
                    conclusion: "Thank you for considering my application. I am eager to discuss how my skills and experience align with the needs of your team. I look forward to the possibility of an interview."
                }
            }));
            toast.dismiss();
            toast.success("Draft generated!");
        }, 1500);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="size-10 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 print:hidden">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/app/my-resumes" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <input
                            type="text"
                            value={clData.title}
                            onChange={(e) => setClData({ ...clData, title: e.target.value })}
                            placeholder="Cover Letter Title"
                            className="bg-transparent border-none focus:ring-0 font-bold text-lg text-slate-900 dark:text-white w-48 lg:w-64"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                        </button>

                        <div className='relative'>
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className='flex items-center py-2 px-6 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'
                            >
                                <Download className='size-4' /> Download
                            </button>

                            {showDownloadMenu && (
                                <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200'>
                                    <button
                                        onClick={downloadAsPdf}
                                        className='flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left'
                                    >
                                        <div className="p-1.5 bg-red-100 text-red-600 rounded-md">
                                            <FileText className="size-4" />
                                        </div>
                                        <span>PDF Document</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid lg:grid-cols-12 gap-8 print:block print:p-0 print:m-0 print:max-w-none">
                {/* Editor Panel */}
                <div className="lg:col-span-5 space-y-6 print:hidden">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1">
                        {[
                            { id: 'sender', icon: User, label: 'Your Info' },
                            { id: 'recipient', icon: Building, label: 'Recipient' },
                            { id: 'content', icon: FileText, label: 'Content' },
                            { id: 'design', icon: Layout, label: 'Design' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <tab.icon className="size-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[500px]">
                        {activeTab === 'sender' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold mb-6">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={clData.senderInfo.name}
                                            onChange={(e) => setClData({ ...clData, senderInfo: { ...clData.senderInfo, name: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Profession</label>
                                        <input
                                            type="text"
                                            value={clData.senderInfo.profession}
                                            onChange={(e) => setClData({ ...clData, senderInfo: { ...clData.senderInfo, profession: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={clData.senderInfo.email}
                                            onChange={(e) => setClData({ ...clData, senderInfo: { ...clData.senderInfo, email: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Phone</label>
                                        <input
                                            type="text"
                                            value={clData.senderInfo.phone}
                                            onChange={(e) => setClData({ ...clData, senderInfo: { ...clData.senderInfo, phone: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Location / Address</label>
                                        <input
                                            type="text"
                                            value={clData.senderInfo.location}
                                            onChange={(e) => setClData({ ...clData, senderInfo: { ...clData.senderInfo, location: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'recipient' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold mb-6">Recipient Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Hiring Manager Name</label>
                                        <input
                                            type="text"
                                            value={clData.recipientName}
                                            onChange={(e) => setClData({ ...clData, recipientName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Role / Title</label>
                                        <input
                                            type="text"
                                            value={clData.recipientRole}
                                            onChange={(e) => setClData({ ...clData, recipientRole: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Company Name</label>
                                        <input
                                            type="text"
                                            value={clData.companyName}
                                            onChange={(e) => setClData({ ...clData, companyName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Company Address</label>
                                        <input
                                            type="text"
                                            value={clData.companyAddress}
                                            onChange={(e) => setClData({ ...clData, companyAddress: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">Letter Content</h3>
                                    <button
                                        onClick={generateAIContent}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <Sparkles className="size-3" />
                                        Auto Draft
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Salutation</label>
                                        <input
                                            type="text"
                                            value={clData.salutation || ''}
                                            onChange={(e) => setClData({ ...clData, salutation: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Introduction</label>
                                        <textarea
                                            rows={3}
                                            value={clData.content?.introduction || ''}
                                            onChange={(e) => setClData({ ...clData, content: { ...(clData.content || {}), introduction: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Main Body</label>
                                        <textarea
                                            rows={8}
                                            value={clData.content?.body || ''}
                                            onChange={(e) => setClData({ ...clData, content: { ...(clData.content || {}), body: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Conclusion</label>
                                        <textarea
                                            rows={3}
                                            value={clData.content?.conclusion || ''}
                                            onChange={(e) => setClData({ ...clData, content: { ...(clData.content || {}), conclusion: e.target.value } })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Closing</label>
                                            <input
                                                type="text"
                                                value={clData.closing || ''}
                                                onChange={(e) => setClData({ ...clData, closing: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-6">Visual Identity</h3>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-400 mb-3 block">Accent Color</label>
                                    <div className="flex flex-wrap gap-4">
                                        {['#475569', '#dc2626', '#2563eb', '#059669', '#7c3aed', '#db2777'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setClData({ ...clData, accentColor: color })}
                                                className={`size-10 rounded-full border-4 transition-all ${clData.accentColor === color ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-7 print:w-full print:absolute print:top-0 print:left-0 print:z-50 print:m-0 print:p-0">
                    <div className="sticky top-24 print:static">
                        <div className="mb-4 flex items-center justify-between px-4 print:hidden">
                            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Live Preview</h3>
                            <span className="text-xs text-slate-400">A4 Letter Space</span>
                        </div>
                        <div className="scale-[0.85] lg:scale-[0.9] xl:scale-100 origin-top shadow-2xl rounded-xl overflow-hidden print:shadow-none print:transform-none print:overflow-visible print:rounded-none">
                            <CoverLetterPreview data={clData} accentColor={clData.accentColor} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CoverLetterBuilder;
