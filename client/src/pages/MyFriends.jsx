import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import { UserCheck, UserX, MessageCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

const MyFriends = () => {
    const { token } = useSelector(state => state.auth);
    const { language } = useLanguage();
    const t = (key) => getTranslation(language, key);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [sentRequests, setSentRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [friendsRes, requestsRes, sentRequestsRes] = await Promise.all([
                api.get('/api/friends', { headers: { Authorization: token } }),
                api.get('/api/friends/requests', { headers: { Authorization: token } }),
                api.get('/api/friends/requests/sent', { headers: { Authorization: token } })
            ]);
            setFriends(friendsRes.data.friends);
            setRequests(requestsRes.data.requests);
            setSentRequests(sentRequestsRes.data.requests);
        } catch (error) {
            console.error('Error loading friends data:', error);
            toast.error(t('failedToLoadFriends'));
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await api.post('/api/friends/accept', { requestId }, {
                headers: { Authorization: token }
            });
            toast.success(t('friendRequestAccepted'));
            loadData();
        } catch (error) {
            toast.error(t('failedToAcceptRequest'));
        }
    };

    const handleReject = async (requestId) => {
        try {
            await api.post('/api/friends/reject', { requestId }, {
                headers: { Authorization: token }
            });
            toast.success(t('friendRequestRejected'));
            loadData();
        } catch (error) {
            toast.error(t('failedToRejectRequest'));
        }
    };

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm(t('cancelFriendRequestConfirm'))) return;
        try {
            await api.post('/api/friends/cancel', { requestId }, {
                headers: { Authorization: token }
            });
            toast.success(t('requestCancelled'));
            loadData();
        } catch (error) {
            toast.error(t('failedToCancelRequest'));
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm(t('removeFriendConfirm'))) return;
        try {
            await api.post('/api/friends/remove', { friendId }, {
                headers: { Authorization: token }
            });
            toast.success(t('friendRemoved'));
            loadData();
        } catch (error) {
            toast.error(t('failedToRemoveFriend'));
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950'>
                <div className='animate-spin size-12 border-4 border-indigo-600 border-t-transparent rounded-full'></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950 p-8'>
            <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3'>
                    <Users className="size-8 text-indigo-600" />
                    {t('myNetwork')}
                </h1>

                {/* Requests Tabs */}
                <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'received' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {t('receivedRequests')} ({requests.length})
                        {activeTab === 'received' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'sent' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {t('sentRequests')} ({sentRequests.length})
                        {activeTab === 'sent' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-full"></div>}
                    </button>
                </div>

                {/* Friend Requests Lists */}
                <div className='mb-12'>
                    {activeTab === 'received' ? (
                        requests.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {requests.map(req => (
                                    <div key={req._id} className='bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='size-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-600'>
                                                {req.sender.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='font-semibold text-slate-900 dark:text-white'>{req.sender.name}</p>
                                                <p className='text-xs text-slate-500'>{req.sender.email}</p>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleAccept(req._id)}
                                                className='p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 rounded-lg transition-colors'
                                                title={t('accept')}
                                            >
                                                <UserCheck className='size-5' />
                                            </button>
                                            <button
                                                onClick={() => handleReject(req._id)}
                                                className='p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                                title={t('reject')}
                                            >
                                                <UserX className='size-5' />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm italic">{t('noReceivedRequests')}</p>
                        )
                    ) : (
                        sentRequests.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {sentRequests.map(req => (
                                    <div key={req._id} className='bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400'>
                                                {req.recipient.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='font-semibold text-slate-900 dark:text-white'>{req.recipient.name}</p>
                                                <p className='text-xs text-slate-500'>{req.recipient.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelRequest(req._id)}
                                            className='px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs font-medium'
                                        >
                                            {t('cancelRequest')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm italic">{t('noSentRequests')}</p>
                        )
                    )}
                </div>

                {/* Friends List Section */}
                <div>
                    <h2 className='text-xl font-semibold text-slate-900 dark:text-white mb-4'>{t('friends')} ({friends.length})</h2>
                    {friends.length === 0 ? (
                        <div className='bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center'>
                            <Users className='size-12 mx-auto mb-4 text-slate-300' />
                            <p className='text-slate-500'>{t('noFriendsYet')}</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {friends.map(friend => (
                                <div key={friend._id} className='bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='size-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-600'>
                                            {friend.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-slate-900 dark:text-white'>{friend.name}</p>
                                            <p className='text-xs text-slate-500'>{t('friend')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/app/chat/${friend._id}`)}
                                            className='p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 rounded-lg transition-colors'
                                            title={t('message')}
                                        >
                                            <MessageCircle className='size-5' />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFriend(friend._id)}
                                            className='p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                                            title={t('removeFriend')}
                                        >
                                            <UserX className='size-5' />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyFriends;
