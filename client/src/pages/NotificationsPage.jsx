import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Bell, UserPlus, UserCheck, MessageSquare, Briefcase, Heart, MessageCircle, CheckCheck, Check, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const iconMap = {
    connection_request: UserPlus,
    connection_accepted: UserCheck,
    new_message: MessageSquare,
    job_posted: Briefcase,
    post_like: Heart,
    post_comment: MessageCircle,
};

const colorMap = {
    connection_request: 'var(--primary)',
    connection_accepted: 'var(--success)',
    new_message: 'var(--accent)',
    job_posted: 'var(--warning)',
    post_like: 'var(--danger)',
    post_comment: 'var(--primary)',
};

const bgMap = {
    connection_request: 'rgba(99, 102, 241, 0.1)',
    connection_accepted: 'rgba(16, 185, 129, 0.1)',
    new_message: 'rgba(6, 182, 212, 0.1)',
    job_posted: 'rgba(245, 158, 11, 0.1)',
    post_like: 'rgba(239, 68, 68, 0.1)',
    post_comment: 'rgba(99, 102, 241, 0.1)',
};

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, isLoading } = useSelector((state) => state.notifications);
    const [activeTab, setActiveTab] = useState('all');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);

    useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'requests') fetchPendingRequests();
    }, [activeTab]);

    const fetchPendingRequests = async () => {
        setPendingLoading(true);
        try {
            const { data } = await API.get('/connections/pending');
            setPendingRequests(data);
        } catch { /* ignore */ }
        setPendingLoading(false);
    };

    const handleAccept = async (connectionId) => {
        try {
            await API.put(`/connections/accept/${connectionId}`);
            setPendingRequests(pendingRequests.filter((r) => r._id !== connectionId));
            toast.success('Connection accepted!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
    };

    const handleReject = async (connectionId) => {
        try {
            await API.put(`/connections/reject/${connectionId}`);
            setPendingRequests(pendingRequests.filter((r) => r._id !== connectionId));
            toast.success('Request declined');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    };

    const handleRead = (id) => dispatch(markNotificationRead(id));

    const handleReadAll = async () => {
        try {
            await API.put('/notifications/read-all');
            dispatch(fetchNotifications());
            toast.success('All marked as read');
        } catch { /* ignore */ }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
    };

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Notifications</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>Stay updated with your activity</p>
                </div>
                {activeTab === 'all' && items.some((n) => !n.read) && (
                    <button onClick={handleReadAll} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                        <CheckCheck size={16} /> Mark all read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                {[
                    { id: 'all', label: 'All Notifications', icon: Bell },
                    { id: 'requests', label: 'Connection Requests', icon: Users },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 22px', borderRadius: '14px', fontSize: '14px', fontWeight: '600',
                            cursor: 'pointer', border: `1.5px solid ${activeTab === id ? 'var(--primary)' : 'var(--border)'}`,
                            background: activeTab === id ? 'var(--primary-gradient)' : 'var(--bg-card)',
                            color: activeTab === id ? 'white' : 'var(--text-secondary)',
                            boxShadow: activeTab === id ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Icon size={16} /> {label}
                        {id === 'requests' && pendingRequests.length > 0 && (
                            <span style={{
                                width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: activeTab === id ? 'rgba(255,255,255,0.3)' : 'var(--danger)', color: 'white',
                            }}>{pendingRequests.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Connection Requests Tab */}
            {activeTab === 'requests' && (
                <>
                    {pendingLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
                    ) : pendingRequests.length === 0 ? (
                        <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-tertiary)', boxShadow: 'var(--shadow-sm)',
                            }}>
                                <Users size={28} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No pending requests</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>You're all caught up!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pendingRequests.map((req, i) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
                                >
                                    <img
                                        src={req.sender?.profilePic || `https://ui-avatars.com/api/?name=${req.sender?.name}&background=6366f1&color=fff`}
                                        alt=""
                                        style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => navigate(`/profile/${req.sender?._id}`)}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}
                                            onClick={() => navigate(`/profile/${req.sender?._id}`)}
                                        >{req.sender?.name}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {req.sender?.jobRole}{req.sender?.company ? ` at ${req.sender.company}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                        <button onClick={() => handleAccept(req._id)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                                            <Check size={14} /> Accept
                                        </button>
                                        <button onClick={() => handleReject(req._id)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                                            <X size={14} /> Decline
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* All Notifications Tab */}
            {activeTab === 'all' && (
                <>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
                    ) : items.length === 0 ? (
                        <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--bg-tertiary)', boxShadow: 'var(--shadow-sm)',
                            }}>
                                <Bell size={28} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No notifications yet</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>You'll be notified about important updates</p>
                        </div>
                    ) : (
                        <div style={{ ...cardStyle, padding: '8px', overflow: 'hidden' }}>
                            {items.map((n, i) => {
                                const Icon = iconMap[n.type] || Bell;
                                const color = colorMap[n.type] || 'var(--text-muted)';
                                const bg = bgMap[n.type] || 'rgba(148,163,184,0.1)';
                                return (
                                    <motion.div
                                        key={n._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => { if (!n.read) handleRead(n._id); }}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '14px',
                                            padding: '16px 20px', cursor: 'pointer', borderRadius: '14px',
                                            transition: 'background 0.15s',
                                            background: n.read ? 'transparent' : 'var(--bg-tertiary)',
                                        }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            background: bg,
                                        }}>
                                            <Icon size={20} style={{ color }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {n.fromUser?.profilePic && (
                                                    <img src={n.fromUser.profilePic} alt="" style={{ width: '24px', height: '24px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                                                )}
                                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: n.read ? '400' : '600', lineHeight: '1.5' }}>{n.message}</p>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '8px' }} />}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Bottom spacer */}
            <div style={{ height: '32px' }} />
        </div>
    );
};

export default NotificationsPage;
