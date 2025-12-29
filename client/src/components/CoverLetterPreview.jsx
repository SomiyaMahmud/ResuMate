import React from 'react';

const CoverLetterPreview = ({ data, accentColor = '#3b82f6' }) => {
    const {
        senderInfo = {},
        recipientName,
        recipientRole,
        companyName,
        companyAddress,
        date,
        salutation,
        content = {},
        closing
    } = data;

    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="w-full bg-white shadow-2xl min-h-[1056px] flex flex-col text-slate-800 font-serif overflow-hidden" id="cover-letter-preview">
            {/* Header / Top Section */}
            <div className="flex flex-1">
                {/* Left Sidebar Accent */}
                <div className="w-1/3 p-10 bg-slate-50 border-r border-slate-100 flex flex-col gap-8">
                    <div className="mb-4">
                        <div className="size-16 rounded-2xl mb-4" style={{ backgroundColor: accentColor }}></div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                            {senderInfo.name || "Your Name"}
                        </h1>
                        <p className="text-sm font-medium opacity-70 mt-1 uppercase tracking-wider">
                            {senderInfo.profession || "Professional Title"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact</p>
                            <p className="text-xs break-all">{senderInfo.email}</p>
                            <p className="text-xs">{senderInfo.phone}</p>
                        </div>
                        {senderInfo.location && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Address</p>
                                <p className="text-xs">{senderInfo.location}</p>
                            </div>
                        )}
                        {senderInfo.linkedin && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Social</p>
                                <p className="text-xs truncate">{senderInfo.linkedin}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-12 pr-16 bg-white">
                    <div className="mb-12">
                        <p className="text-sm font-medium text-slate-500 mb-8">{formattedDate}</p>

                        <div className="space-y-1">
                            {recipientName && <p className="text-sm font-bold text-slate-900">{recipientName}</p>}
                            {recipientRole && <p className="text-xs font-medium text-slate-600">{recipientRole}</p>}
                            {companyName && <p className="text-sm font-bold text-indigo-600">{companyName}</p>}
                            {companyAddress && <p className="text-xs text-slate-500">{companyAddress}</p>}
                        </div>
                    </div>

                    <div className="space-y-6 text-sm leading-relaxed text-slate-700">
                        <p className="font-bold text-slate-900">{salutation || "Dear Hiring Manager,"}</p>

                        <div className="space-y-4">
                            {content.introduction ? (
                                <p>{content.introduction}</p>
                            ) : (
                                <p className="italic text-slate-400">Write your introduction here. Mention the position you're applying for and why you're a great fit.</p>
                            )}

                            {content.body ? (
                                <div className="whitespace-pre-wrap">{content.body}</div>
                            ) : (
                                <p className="italic text-slate-400">Describe your key achievements, skills, and how you can add value to the company.</p>
                            )}

                            {content.conclusion ? (
                                <p>{content.conclusion}</p>
                            ) : (
                                <p className="italic text-slate-400">Summarize your interest and call for an interview.</p>
                            )}
                        </div>

                        <div className="pt-8">
                            <p className="mb-8">{closing || "Sincerely,"}</p>
                            <p className="font-bold text-slate-900 text-lg">{senderInfo.name || "Your Name"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @page {
                    size: letter;
                    margin: 0;
                }
                @media print {
                    html, body {
                        width: 8.5in;
                        height: 11in;
                        overflow: hidden;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #cover-letter-preview, #cover-letter-preview * {
                        visibility: visible;
                    }
                    #cover-letter-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        background-color: white !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CoverLetterPreview;
