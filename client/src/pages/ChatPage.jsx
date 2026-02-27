import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations, fetchMessages, sendMessage, setActiveChat, addMessage } from '../store/slices/chatSlice';
import { getSocket } from '../services/socket';
import { motion } from 'framer-motion';
import { Send, Search, MessageCircle } from 'lucide-react';

const ChatPage = () => {
    const { userId } = useParams();
    const dispatch = useDispatch();
    const { conversations, messages, activeChat, onlineUsers, isLoading, typingUsers } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => { dispatch(fetchConversations()); }, [dispatch]);

    useEffect(() => {
        if (userId) {
            const conv = conversations.find((c) => c.user?._id === userId);
            if (conv) dispatch(setActiveChat(conv.user));
            else dispatch(setActiveChat({ _id: userId }));
            dispatch(fetchMessages(userId));
        }
    }, [userId, dispatch, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChat?._id) return;
        const socket = getSocket();
        await dispatch(sendMessage({ receiverId: activeChat._id, message: messageText }));
        socket?.emit('sendMessage', {
            receiverId: activeChat._id,
            senderId: user._id,
            senderName: user.name,
            senderPic: user.profilePic,
            message: messageText,
        });
        socket?.emit('stopTyping', { receiverId: activeChat._id, senderId: user._id });
        setMessageText('');
    };

    const handleTyping = (e) => {
        setMessageText(e.target.value);
        const socket = getSocket();
        if (!socket || !activeChat) return;
        socket.emit('typing', { receiverId: activeChat._id, senderId: user._id });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { receiverId: activeChat._id, senderId: user._id });
        }, 2000);
    };

    const selectConversation = (conv) => {
        dispatch(setActiveChat(conv.user));
        dispatch(fetchMessages(conv.user._id));
    };

    const filteredConversations = conversations.filter((c) =>
        c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '20px' }}>
            {/* Conversations Sidebar */}
            <div
                className="hidden md:flex"
                style={{
                    width: '320px', flexShrink: 0, flexDirection: 'column', overflow: 'hidden',
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Messages</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search conversations..."
                            style={{
                                width: '100%', padding: '11px 14px 11px 40px', borderRadius: '12px', fontSize: '13px',
                                border: '1.5px solid var(--border)', background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif',
                            }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredConversations.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-muted)' }}>No conversations yet</p>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.user?._id}
                                onClick={() => selectConversation(conv)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '14px 20px', textAlign: 'left', border: 'none', cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    background: activeChat?._id === conv.user?._id ? 'var(--bg-tertiary)' : 'transparent',
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <img
                                        src={conv.user?.profilePic || `https://ui-avatars.com/api/?name=${conv.user?.name}&background=6366f1&color=fff&size=40`}
                                        alt="" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }}
                                    />
                                    {onlineUsers.includes(conv.user?._id) && (
                                        <span style={{
                                            position: 'absolute', bottom: '-1px', right: '-1px', width: '13px', height: '13px',
                                            borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-card)',
                                        }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {conv.user?.name}
                                        </p>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span style={{
                                        width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', fontSize: '10px', fontWeight: '700', color: 'white',
                                        background: 'var(--primary)', flexShrink: 0,
                                    }}>{conv.unreadCount}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)', minWidth: 0,
            }}>
                {!activeChat ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-tertiary)', boxShadow: 'var(--shadow-sm)',
                            }}>
                                <MessageCircle size={28} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Select a conversation</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Choose a contact to start messaging</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img
                                    src={activeChat.profilePic || `https://ui-avatars.com/api/?name=${activeChat.name}&background=6366f1&color=fff&size=44`}
                                    alt="" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }}
                                />
                                {onlineUsers.includes(activeChat._id) && (
                                    <span style={{
                                        position: 'absolute', bottom: '-1px', right: '-1px', width: '13px', height: '13px',
                                        borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-card)',
                                    }} />
                                )}
                            </div>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{activeChat.name}</p>
                                <p style={{ fontSize: '12px', color: onlineUsers.includes(activeChat._id) ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {typingUsers.includes(activeChat._id) ? 'Typing...' : onlineUsers.includes(activeChat._id) ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {isLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><div className="spinner" /></div>
                            ) : messages.length === 0 ? (
                                <p style={{ textAlign: 'center', fontSize: '13px', padding: '32px 0', color: 'var(--text-muted)' }}>No messages yet. Say hello! 👋</p>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMine = (msg.sender?._id || msg.sender || msg.senderId) === user._id;
                                    return (
                                        <motion.div key={msg._id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                            <div style={{
                                                maxWidth: '65%', padding: '12px 18px', borderRadius: '18px',
                                                borderBottomRightRadius: isMine ? '6px' : '18px',
                                                borderBottomLeftRadius: isMine ? '18px' : '6px',
                                                background: isMine ? 'var(--primary-gradient)' : 'var(--bg-tertiary)',
                                                color: isMine ? 'white' : 'var(--text-primary)',
                                                boxShadow: 'var(--shadow-xs)',
                                                wordBreak: 'break-word',
                                            }}>
                                                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.message}</p>
                                                <p style={{ fontSize: '10px', marginTop: '6px', opacity: 0.65 }}>{formatTime(msg.createdAt)}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{
                            display: 'flex', gap: '12px', padding: '18px 24px',
                            borderTop: '1px solid var(--border)',
                        }}>
                            <input
                                value={messageText}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '14px 18px', borderRadius: '14px', fontSize: '14px',
                                    border: '1.5px solid var(--border)', background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif',
                                    minWidth: 0,
                                }}
                            />
                            <button type="submit" disabled={!messageText.trim()} className="btn-primary" style={{ padding: '14px 20px', flexShrink: 0 }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
