import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../configs/api.js';
import { Send, ArrowLeft, User, Search, MessageSquare, Users, Pencil, Trash2, X, Check, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
    const { otherUserId } = useParams();
    const { user, token } = useSelector(state => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recentChats, setRecentChats] = useState([]);
    const [friends, setFriends] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showOptionsId, setShowOptionsId] = useState(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            loadInitialData();
        }
    }, [token]);

    useEffect(() => {
        if (token && otherUserId) {
            loadMessages();
            fetchOtherUser();
        }
    }, [otherUserId, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadInitialData = async () => {
        try {
            console.log('Loading chat initial data...');
            const results = await Promise.allSettled([
                api.get('/api/chat/recent', { headers: { Authorization: token } }),
                api.get('/api/friends', { headers: { Authorization: token } })
            ]);

            if (results[0].status === 'fulfilled') {
                console.log('Recent Chats Loaded:', results[0].value.data);
                setRecentChats(results[0].value.data.chats || []);
            } else {
                console.error('Recent Chats Error:', results[0].reason);
            }

            if (results[1].status === 'fulfilled') {
                console.log('Friends Loaded:', results[1].value.data);
                setFriends(results[1].value.data.friends || []);
            } else {
                console.error('Friends Error:', results[1].reason);
            }

        } catch (error) {
            console.error('Error loading chat initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOtherUser = async () => {
        try {
            // Find in friends list first
            let found = friends.find(f => f._id === otherUserId) || recentChats.find(c => c._id === otherUserId);
            if (found) {
                setOtherUser(found);
            } else {
                const { data } = await api.get(`/api/users/data`, {
                    headers: { Authorization: token },
                    params: { userId: otherUserId } // Assuming the API can handle this or similar
                });
                setOtherUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching other user:', error);
        }
    };

    const loadMessages = async () => {
        try {
            const { data } = await api.get(`/api/chat/messages/${otherUserId}`, {
                headers: { Authorization: token }
            });
            setMessages(data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !otherUserId) return;

        try {
            const { data } = await api.post('/api/chat/send', {
                recipientId: otherUserId,
                content: newMessage
            }, {
                headers: { Authorization: token }
            });
            setMessages([...messages, data.data]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return;
        try {
            const { data } = await api.put('/api/chat/edit', {
                messageId,
                content: editContent
            }, {
                headers: { Authorization: token }
            });
            setMessages(messages.map(m => m._id === messageId ? data.data : m));
            setEditingMessageId(null);
            setEditContent('');
            toast.success('Message updated');
        } catch (error) {
            toast.error('Failed to update message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/api/chat/delete/${messageId}`, {
                headers: { Authorization: token }
            });
            setMessages(messages.filter(m => m._id !== messageId));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRecent = recentChats.filter(chatUser =>
        chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search friends..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col gap-4 p-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="size-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (friends.length === 0) ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            <Users className="size-12 mx-auto mb-3 opacity-20" />
                            <p>No friends yet.</p>
                            <p className="mt-1 text-xs">Connect with others in the forum!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredFriends.map(friend => (
                                <div
                                    key={friend._id}
                                    onClick={() => navigate(`/app/chat/${friend._id}`)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${otherUserId === friend._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-indigo-600' : ''}`}
                                >
                                    <div className="size-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-600">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{friend.name}</h3>
                                        <p className="text-xs text-slate-500 truncate">Tap to message</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
                {otherUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <ArrowLeft className="size-5" />
                            </button>
                            <div className="size-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-600">
                                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">{otherUser?.name || 'User'}</h2>
                                <p className="text-xs text-emerald-500 font-medium">Online</p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                                const isEditing = editingMessageId === msg._id;

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2">
                                                {isMe && !isEditing && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingMessageId(msg._id);
                                                                setEditContent(msg.content);
                                                            }}
                                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600"
                                                        >
                                                            <Pencil className="size-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMessage(msg._id)}
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className={`rounded-2xl p-3 shadow-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-tl-none'
                                                    }`}>
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                                            <textarea
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleEditMessage(msg._id);
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingMessageId(null);
                                                                    }
                                                                }}
                                                                className="w-full bg-indigo-700 text-white border-none focus:ring-0 rounded p-1 text-sm outline-none resize-none"
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setEditingMessageId(null)} className="p-1 hover:bg-indigo-500 rounded">
                                                                    <X className="size-3" />
                                                                </button>
                                                                <button onClick={() => handleEditMessage(msg._id)} className="p-1 hover:bg-indigo-500 rounded">
                                                                    <Check className="size-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 px-1">
                                                <p className={`text-[10px] ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                                {msg.isEdited && (
                                                    <p className="text-[10px] text-slate-400 italic">edited</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl transition-colors"
                                >
                                    <Send className="size-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="size-16 mb-4 opacity-20" />
                        <p>Select a friend to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
