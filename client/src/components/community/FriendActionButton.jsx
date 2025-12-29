import React, { useState, useEffect } from 'react';
import api from '../../configs/api.js';
import { UserPlus, UserCheck, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FriendActionButton = ({ userId, userName }) => {
    const { user, token } = useSelector(state => state.auth);
    const [status, setStatus] = useState('none'); // none, friends, request_sent, request_received
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && userId && user?._id !== userId) {
            checkStatus();
        }
    }, [userId, token, user]);

    const checkStatus = async () => {
        try {
            const { data } = await api.get(`/api/friends/status/${userId}`, {
                headers: { Authorization: token }
            });
            setStatus(data.status);
        } catch (error) {
            console.error('Error checking friend status:', error);
        }
    };

    const handleSendRequest = async (e) => {
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to send friend requests');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/friends/request', { recipientId: userId }, {
                headers: { Authorization: token }
            });
            setStatus('request_sent');
            toast.success('Friend request sent');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();
        navigate(`/app/chat/${userId}`);
    };

    if (!user || user._id === userId) return null;

    return (
        <div className="inline-flex items-center gap-2">
            {status === 'none' && (
                <button
                    onClick={handleSendRequest}
                    disabled={loading}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title='Add Friend'
                >
                    <UserPlus className="size-4" />
                </button>
            )}
            {status === 'request_sent' && (
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                    <Clock className="size-3" />
                    <span>Pending</span>
                </div>
            )}
            {status === 'request_received' && (
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                    <span>Respond in Profile</span>
                </div>
            )}
            {status === 'friends' && (
                <button
                    onClick={handleChat}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Message Friend"
                >
                    <MessageSquare className="size-4" />
                </button>
            )}
        </div>
    );
};

export default FriendActionButton;
