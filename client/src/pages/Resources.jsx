import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { blogArticles } from '../data/blogData';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

const Resources = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = (key) => getTranslation(language, key);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...new Set(blogArticles.map(article => article.category))];

    const filteredArticles = blogArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/app')}
                            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="size-6 text-slate-600 dark:text-slate-400" />
                        </button>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{t('careerResources')}</h1>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8">
                        {t('expertAdvice')}
                    </p>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <input
                                type="text"
                                placeholder={t('searchArticles')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all ${selectedCategory === category
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {category === 'All' ? t('all') : category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
                {filteredArticles.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map(article => (
                            <div
                                key={article.id}
                                onClick={() => navigate(`/app/resources/${article.id}`)}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                                        {article.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                        <Clock className="size-3" />
                                        <span>{article.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                                        {article.summary}
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                        {t('readArticle')} <ArrowRight className="size-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <BookOpen className="size-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('noArticlesFound')}</h3>
                        <p className="text-slate-500">{t('tryAdjustingSearch')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;
