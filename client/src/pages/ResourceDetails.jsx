import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { blogArticles } from '../data/blogData';

const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const article = blogArticles.find(a => a.id === parseInt(id));

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Article not found</h2>
                    <button
                        onClick={() => navigate('/app/resources')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Image */}
            <div className="h-[400px] w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-4 lg:left-8 z-20">
                    <button
                        onClick={() => navigate('/app/resources')}
                        className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white transition-colors border border-white/20"
                    >
                        <ArrowLeft className="size-6" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-12 z-20">
                    <div className="max-w-4xl mx-auto">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-4 inline-block">
                            {article.category}
                        </span>
                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            {article.title}
                        </h1>
                        <div className="flex items-center gap-6 text-slate-200 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>{article.readTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                <span>Updated today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 lg:px-8 -mt-10 relative z-30">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-200 dark:border-slate-800">


                    <div
                        className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300
                            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:leading-relaxed prose-p:mb-6
                            prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400
                            prose-li:marker:text-indigo-500"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Navigation to other articles could go here */}
                </div>
            </div>
        </div>
    );
};

export default ResourceDetails;
